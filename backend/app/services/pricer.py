"""
pricer.py
---------
Orchestrates the Monte Carlo pricing pipeline:
    random generation → GBM paths → payoff → discounting → statistics.

Author: Davide91-Git
"""

import time
from dataclasses import dataclass
from typing import Callable

import numpy as np
from numpy.typing import NDArray

from app.services.random_generator import generate_standard_normals
from app.services.gbm import simulate_gbm


@dataclass(frozen=True)
class PricingResult:
    """Container for Monte Carlo pricing output."""
    price: float
    std_error: float
    ci_lower: float
    ci_upper: float
    n_simulations: int
    elapsed_seconds: float


def mc_price(
    S0: float,
    K: float,
    r: float,
    sigma: float,
    T: float,
    n_simulations: int,
    n_steps: int,
    payoff_fn: Callable[[NDArray[np.float64], float, str], NDArray[np.float64]],
    option_type: str,
    antithetic: bool = False,
    seed: int | None = None,
) -> PricingResult:
    """
    Run the full Monte Carlo pricing pipeline.

    Args:
        S0: Initial asset price.
        K: Strike price.
        r: Risk-free rate (annualised).
        sigma: Volatility (annualised).
        T: Time to maturity in years.
        n_simulations: Number of Monte Carlo paths.
        n_steps: Number of time steps per path.
        payoff_fn: Callable(S, K, option_type) → raw payoffs array.
        option_type: "call" or "put".
        antithetic: If True, use antithetic variance reduction.
        seed: Random seed for reproducibility.

    Returns:
        PricingResult with price, standard error, 95% CI, and timing.
    """
    start = time.perf_counter()

    Z = generate_standard_normals(n_simulations, n_steps, antithetic=antithetic, seed=seed)
    S = simulate_gbm(S0, r, sigma, T, Z)
    payoffs = payoff_fn(S, K, option_type)

    discount_factor = np.exp(-r * T)
    discounted = discount_factor * payoffs

    price = float(np.mean(discounted))
    std_error = float(np.std(discounted, ddof=1) / np.sqrt(len(discounted)))

    elapsed = time.perf_counter() - start

    return PricingResult(
        price=price,
        std_error=std_error,
        ci_lower=price - 1.96 * std_error,
        ci_upper=price + 1.96 * std_error,
        n_simulations=len(discounted),
        elapsed_seconds=round(elapsed, 4),
    )