# Technical Documentation — Statistical Methodology

This document describes the statistical and numerical foundations of the Monte Carlo pricing engine. Every formula is mapped to the corresponding code module so the reader can verify implementation choices directly against the source.

The engine follows the standard risk-neutral Monte Carlo framework for derivatives valuation.

----------

## 1. Geometric Brownian Motion under the risk-neutral measure

The underlying asset is assumed to follow a Geometric Brownian Motion (GBM) under the risk-neutral measure $\mathbb{Q}$:

$$dS = r \cdot S , dt + \sigma \cdot S , dW$$

where $r$ is the risk-free rate, $\sigma$ is the volatility, and $dW$ is a Wiener process increment. Applying Itô's lemma to $\log(S)$ yields the exact closed-form solution between consecutive time steps:

$$S(t + \Delta t) = S(t) \cdot \exp!\left(\left(r - \tfrac{1}{2}\sigma^2\right)\Delta t + \sigma\sqrt{\Delta t}, Z\right), \quad Z \sim \mathcal{N}(0,1)$$

The risk-neutral measure is used (drift $= r$, not the physical drift $\mu$) because the objective is pricing. Under $\mathbb{Q}$, the discounted expected payoff equals the fair option price.

**Implementation —** `services/gbm.py`. The constants $(r - \frac{1}{2}\sigma^2)\Delta t$ and $\sigma\sqrt{\Delta t}$ are pre-computed once outside the path loop. The recursion is implemented in Numba-compiled code with two variants: a serial version for small batches and a parallel version (`prange` over simulations) for larger ones, selected at runtime via the `parallel` flag.

----------

## 2. Monte Carlo estimation

The option price is the expected discounted payoff under $\mathbb{Q}$:

$$V = e^{-rT} \cdot \mathbb{E}^{\mathbb{Q}}!\left[\text{payoff}(S)\right]$$

The Monte Carlo estimator approximates this expectation by:

1.  Generating $N$ independent price paths via GBM.
2.  Computing the payoff for each path.
3.  Discounting each payoff by $e^{-rT}$.
4.  Taking the sample mean.

$$\hat{V}_{MC} = \frac{1}{N} \sum_{i=1}^{N} e^{-rT} \cdot \text{payoff}_i$$

By the strong law of large numbers, $\hat{V}_{MC} \to V$ almost surely as $N \to \infty$.

**Implementation —** `services/pricer.py`. The discount factor is applied as a vector operation (`np.exp(-r * T) * payoffs`), then the sample mean is taken with `np.mean`.

----------

## 3. Standard error and confidence interval

The standard error of the Monte Carlo estimate is:

$$SE = \frac{s}{\sqrt{N}}$$

where $s$ is the sample standard deviation of the discounted payoffs, computed with Bessel's correction (dividing by $N - 1$). The 95% confidence interval follows from the asymptotic normality of the estimator:

$$CI_{95%} = \left[\hat{V}_{MC} - 1.96 \cdot SE,; \hat{V}_{MC} + 1.96 \cdot SE\right]$$

The interval narrows at a rate proportional to $1/\sqrt{N}$ — the well-known slow convergence of Monte Carlo. To halve the error, the number of simulations must be quadrupled. This $1/\sqrt{N}$ rate is the primary motivation for variance reduction techniques.

**Implementation —** `services/pricer.py`. Bessel's correction is applied via `np.std(discounted, ddof=1)` and 1.96 is the standard normal 97.5% quantile.

----------

## 4. Antithetic variance reduction

For each standard normal vector $Z$, the engine also simulates $-Z$. Since $Z$ and $-Z$ share the same marginal distribution $\mathcal{N}(0,1)$ but are perfectly negatively correlated, the variance of the average payoff across the pair satisfies:

$$\text{Var}!\left(\frac{X + X'}{2}\right) = \frac{\text{Var}(X) + \text{Var}(X') + 2,\text{Cov}(X, X')}{4}$$

When $\text{Cov}(X, X') < 0$ — which holds whenever the payoff is a monotone function of $Z$, including European and Asian payoffs — the total variance is strictly lower than with $2N$ independent paths, while random-number generation cost stays at $N$ draws.

**Implementation —** `services/random_generator.py`. When `antithetic=True`, the matrix is doubled via `np.vstack([Z, -Z])`, producing shape $(2N, n_\text{steps})$ from $N$ random draws.

----------

## 5. European payoff

The European option payoff depends only on the terminal price $S(T)$:

$$\text{Call:} \quad \max(S(T) - K,; 0)$$ $$\text{Put:} \quad \max(K - S(T),; 0)$$

This payoff admits the closed-form Black-Scholes-Merton price used as analytical benchmark (see §7).

**Implementation —** `services/payoff.py`, function `european_payoff`. Reads only the terminal column `S[:, -1]` and delegates the $\max(\cdot, 0)$ to the private helper `_terminal_payoff`.

----------

## 6. Asian payoff (fixed-strike, arithmetic average)

The fixed-strike arithmetic-average Asian payoff depends on the average price along the path:

$$\bar{S} = \frac{1}{n} \sum_{i=1}^{n} S(t_i), \quad t_i > 0 \text{ (excluding } S_0\text{)}$$

$$\text{Call:} \quad \max(\bar{S} - K,; 0)$$ $$\text{Put:} \quad \max(K - \bar{S},; 0)$$

No closed-form solution exists for the arithmetic-average Asian option — this is precisely the case for which Monte Carlo is indispensable. The averaging operator dampens the variance of the effective terminal distribution, which generally makes Asian options less expensive than the corresponding European for at-the-money and out-of-the-money strikes. The relationship can reverse for deep in-the-money options or under specific parameter regimes; the engine prices each scenario directly without assuming any ordering.

**Implementation —** `services/payoff.py`, function `asian_payoff`. Computes `np.mean(S[:, 1:], axis=1)` to exclude $S_0$ from the average, then applies `_terminal_payoff`.

----------

## 7. Black-Scholes analytical benchmark

For European options, the closed-form Black-Scholes-Merton price is (Black & Scholes, 1973):

$$\text{Call} = S_0 \cdot N(d_1) - K e^{-rT} \cdot N(d_2)$$ $$\text{Put} = K e^{-rT} \cdot N(-d_2) - S_0 \cdot N(-d_1)$$

where:

$$d_1 = \frac{\ln(S_0/K) + \left(r + \frac{1}{2}\sigma^2\right)T}{\sigma\sqrt{T}}, \qquad d_2 = d_1 - \sigma\sqrt{T}$$

and $N(\cdot)$ is the standard normal CDF. This formula applies only to European options under GBM — it does not generalise to Asian or other path-dependent payoffs.

**Implementation —** `services/black_scholes.py`. $N(\cdot)$ is computed via `scipy.stats.norm.cdf`. The result is streamed alongside the Monte Carlo estimate so the convergence chart shows the MC price approaching the analytical value batch by batch.

----------

## 8. Historical volatility estimation

When pricing with real market data, $\sigma$ is estimated from the historical daily log-returns of the underlying:

$$r_t = \ln!\left(\frac{S_t}{S_{t-1}}\right)$$

$$\hat{\sigma}_{\text{daily}} = \sqrt{\frac{1}{n-1}\sum_{t=1}^{n}\left(r_t - \bar{r}\right)^2}$$

$$\hat{\sigma}_{\text{annual}} = \hat{\sigma}_{\text{daily}} \cdot \sqrt{252}$$

The factor $\sqrt{252}$ annualises the daily standard deviation under the assumption that log-returns are i.i.d. across trading days, with 252 being the conventional number of annual trading days.

The estimation window is configurable. The default `match_maturity` mode sets:

$$\text{window_days} = \max!\left(21,; \lfloor T \cdot 252 \rfloor\right)$$

aligning the volatility lookback with the option's tenor. Fixed windows of 1M, 3M, 6M, 1Y, and 3Y are also available. $S_0$ is the most recent adjusted close price stored in the database.

**Implementation —** `crud/stock.py`, function `compute_historical_volatility`. Queries the most recent `window_days + 1` prices, computes log-returns via `np.diff(np.log(prices))`, and returns the annualised standard deviation with `np.std(log_returns, ddof=1) * np.sqrt(252)`.

----------

## References

-   **Black, F., and Scholes, M.** (1973). The Pricing of Options and Corporate Liabilities. _Journal of Political Economy_, 81(3), 637–654.
-   **Boyle, P. P.** (1977). Options: A Monte Carlo Approach. _Journal of Financial Economics_, 4(3), 323–338.
-   **Glasserman, P.** (2003). _Monte Carlo Methods in Financial Engineering_. Springer-Verlag, New York.
-   **Hull, J. C.** (2017). _Options, Futures, and Other Derivatives_ (10th ed.). Pearson.