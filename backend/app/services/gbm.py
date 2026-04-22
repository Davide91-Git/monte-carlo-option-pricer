"""
gbm.py
------
Simulates asset price paths under the risk-neutral measure
using Geometric Brownian Motion (GBM).

Author: Davide91-Git
"""

import numpy as np
from numpy.typing import NDArray


def simulate_gbm(
    S0: float,
    r: float,
    sigma: float,
    T: float,
    Z: NDArray[np.float64],
) -> NDArray[np.float64]:
    """
    Simulate asset price paths via Geometric Brownian Motion.

    Discretizes the SDE dS = r·S·dt + σ·S·dW into Ito's solution.

    Args:
        S0: Initial asset price.
        r: Risk-free rate (annualised).
        sigma: Volatility (annualised).
        T: Time to maturity in years.
        Z: Standard normal variates, shape (n_simulations, n_steps).

    Returns:
        Full price paths, shape (n_simulations, n_steps + 1) where column 0 is S0.

    Raises:
        ValueError: If S0, sigma or T are not positive.
    """
    if S0 <= 0:
        raise ValueError(f"S0 must be positive, got {S0}")
    if sigma <= 0:
        raise ValueError(f"sigma must be positive, got {sigma}")
    if T <= 0:
        raise ValueError(f"T must be positive, got {T}")

    n_simulations, n_steps = Z.shape
    dt = T / n_steps

    drift = (r - 0.5 * sigma ** 2) * dt
    diffusion = sigma * np.sqrt(dt)

    S = np.empty((n_simulations, n_steps + 1))
    S[:, 0] = S0

    for t in range(n_steps):
        S[:, t + 1] = S[:, t] * np.exp(drift + diffusion * Z[:, t])

    return S
