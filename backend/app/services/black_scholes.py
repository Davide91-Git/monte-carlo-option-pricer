"""
black_scholes.py
----------------
Closed-form Black-Scholes pricing for EU call and put options.
Used as analytical benchmark to validate the Monte Carlo engine.

Author: Davide91-Git
"""

import numpy as np
from scipy.stats import norm


def black_scholes_price(
    S0: float,
    K: float,
    r: float,
    sigma: float,
    T: float,
    option_type: str,
) -> float:
    """
    Black-Scholes price for a European option.

    Args:
        S0: Current asset price.
        K: Strike price.
        r: Risk-free rate (annualised).
        sigma: Volatility (annualised).
        T: Time to maturity in years.
        option_type: "call" or "put".

    Returns:
        Option price.

    Raises:
        ValueError: If inputs are invalid.
    """
    if S0 <= 0:
        raise ValueError(f"S0 must be positive, got {S0}")
    if K <= 0:
        raise ValueError(f"K must be positive, got {K}")
    if sigma <= 0:
        raise ValueError(f"sigma must be positive, got {sigma}")
    if T <= 0:
        raise ValueError(f"T must be positive, got {T}")
    if option_type not in ("call", "put"):
        raise ValueError(f"option_type must be 'call' or 'put', got '{option_type}'")

    d1 = (np.log(S0 / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)

    if option_type == "call":
        return float(S0 * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2))

    return float(K * np.exp(-r * T) * norm.cdf(-d2) - S0 * norm.cdf(-d1))
