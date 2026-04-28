"""
gbm.py
------
Simulates asset price paths under the risk-neutral measure
using Geometric Brownian Motion (GBM).

TWO IMPLEMENTATIONS:

    simulate_gbm_serial(S0, r, sigma, T, Z)
        Best for small N (< 10k paths) where thread overhead
        would dominate the computation.
 
    simulate_gbm_parallel(S0, r, sigma, T, Z)
        Parallelises the outer loop over simulations across
        all available CPU cores. Best for large N (≥ 10k paths).
 
    simulate_gbm(S0, r, sigma, T, Z, parallel=False)
        Public dispatcher — routes to serial or parallel based
        on the `parallel` flag. This is the only function
        called from pricer.py.
 
Author: Davide91-Git
"""

import numpy as np
from numpy.typing import NDArray
from numba import njit, prange


# ── Serial implementation ─────────────────────────────────────
@njit
def _simulate_serial(
    S0:        float,
    drift:     float,
    diffusion: float,
    Z:         NDArray[np.float64],
    S:         NDArray[np.float64],
) -> None:
    """
    Fill price path matrix S in-place using a single thread.

    Args:
        S0        : Initial asset price.
        drift     : Pre-computed (r - 0.5*σ²)*dt scalar.
        diffusion : Pre-computed σ*√dt scalar.
        Z         : Standard normal variates, shape (n_sims, n_steps).
        S         : Output matrix, shape (n_sims, n_steps + 1).
                    Column 0 must be initialised with S0 by the caller.                  
    """
    n_simulations = Z.shape[0]
    n_steps       = Z.shape[1]

    for i in range(n_simulations):
        for t in range(n_steps):
            S[i, t + 1] = S[i, t] * np.exp(drift + diffusion * Z[i, t])


# ── Parallel implementation ───────────────────────────────────
@njit(parallel=True)
def _simulate_parallel(
    S0:        float,
    drift:     float,
    diffusion: float,
    Z:         NDArray[np.float64],
    S:         NDArray[np.float64],
) -> None:
    """
    Fill price path matrix S in-place using multiple threads.
 
    The outer loop over simulations (i) is parallelised with prange.
    Each thread handles an independent subset of rows.
 
    Args: identical to _simulate_serial.
    """
    n_simulations = Z.shape[0]
    n_steps       = Z.shape[1]

    for i in prange(n_simulations):
        for t in range(n_steps):
            S[i, t + 1] = S[i, t] * np.exp(drift + diffusion * Z[i, t])


# ── Public dispatcher ─────────────────────────────────────────

def simulate_gbm(
    S0: float,
    r: float,
    sigma: float,
    T: float,
    Z: NDArray[np.float64],
    parallel: bool = False,
) -> NDArray[np.float64]:
    """
    Simulate asset price paths via Geometric Brownian Motion.
    Discretizes the SDE dS = r·S·dt + σ·S·dW into Ito's solution.

    Dispatches to the serial or parallel Numba implementation
    based on the `parallel` flag.

    Args:
        S0: Initial asset price.
        r: Risk-free rate (annualised).
        sigma: Volatility (annualised).
        T: Time to maturity in years.
        Z: Standard normal variates, shape (n_simulations, n_steps).
        parallel: If True, use multi-thread implementation.

    Returns:
        Full price paths, shape (n_simulations, n_steps + 1).
        Column 0 is always S0 while Column -1 is the terminal price S(T).

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

    # Pre-allocate output matrix
    S = np.empty((n_simulations, n_steps + 1))
    S[:, 0] = S0

    if parallel:
        _simulate_parallel(S0, drift, diffusion, Z, S)
    else:
        _simulate_serial(S0, drift, diffusion, Z, S)
    
    return S
