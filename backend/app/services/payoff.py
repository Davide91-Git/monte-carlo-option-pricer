"""
payoff.py
---------
Computes raw (undiscounted) payoffs for vanilla and path-dependent options.

Author: Davide91-Git
"""

import numpy as np
from numpy.typing import NDArray


def _terminal_payoff(
    S_T: NDArray[np.float64],
    K: float,
    option_type: str,
) -> NDArray[np.float64]:
    """
    Apply max(S-K, 0) or max(K-S, 0) to a reference price vector.
    """
    if option_type == "call":
        return np.maximum(S_T - K, 0.0)
    return np.maximum(K - S_T, 0.0)


def european_payoff(
    S: NDArray[np.float64],
    K: float,
    option_type: str,
) -> NDArray[np.float64]:
    """
    Payoff based on terminal price S(T).

    Args:
        S: Price paths, shape (n_simulations, n_steps + 1).
        K: Strike price.
        option_type: "call" or "put".

    Returns:
        Raw payoff per simulation, shape (n_simulations,).
    """
    _validate(K, option_type)
    return _terminal_payoff(S[:, -1], K, option_type)


def asian_payoff(
    S: NDArray[np.float64],
    K: float,
    option_type: str,
) -> NDArray[np.float64]:
    """
    Payoff based on arithmetic average of the path (fixed-strike Asian).

    Args:
        S: Price paths, shape (n_simulations, n_steps + 1).
        K: Strike price.
        option_type: "call" or "put".

    Returns:
        Raw payoff per simulation, shape (n_simulations,).
    """
    _validate(K, option_type)
    S_avg = np.mean(S[:, 1:], axis=1)
    return _terminal_payoff(S_avg, K, option_type)


def _validate(K: float, option_type: str) -> None:
    if K <= 0:
        raise ValueError(f"K must be positive, got {K}")
    if option_type not in ("call", "put"):
        raise ValueError(f"option_type must be 'call' or 'put', got '{option_type}'")