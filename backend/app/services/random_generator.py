"""
random_generator.py
-------------------
Generates a matrix of standard normal random variates Z ~ N(0,1) of shape (n_simulations, n_steps).

Author: Davide91-Git
"""

import numpy as np
from numpy.typing import NDArray


def generate_standard_normals(
    n_simulations: int,
    n_steps: int,
    antithetic: bool = False,
    seed: int | None = None,
) -> NDArray[np.float64]:
    """
    Generate a matrix of i.i.d. standard normal random variates.

    Args:
        n_simulations (int): Number of Monte Carlo paths (rows).
        n_steps (int): Number of time steps per path (columns).
        antithetic (bool, optional): If True, doubles rows via antithetic variates. Default: False.
        seed (int | None, optional): Random seed for reproducibility. Default: None.

    Returns:
        NDArray[np.float64]: Shape (n_simulations, n_steps) or (2*n_simulations, n_steps) if antithetic.

    Raises:
        ValueError: If n_simulations or n_steps are not positive integers.
    """
    if n_simulations <= 0:
        raise ValueError(f"n_simulations must be a positive integer, got {n_simulations}")
    if n_steps <= 0:
        raise ValueError(f"n_steps must be a positive integer, got {n_steps}")

    rng = np.random.default_rng(seed)
    Z = rng.standard_normal(size=(n_simulations, n_steps))

    if antithetic:
        Z = np.vstack([Z, -Z])

    return Z


def summary(Z: NDArray[np.float64]) -> dict[str, object]:
    """
    Return basic descriptive statistics of the generated matrix.

    Args:
        Z (NDArray[np.float64]): Matrix of standard normal variates, shape (n_simulations, n_steps).

    Returns:
        dict[str, object]: shape, mean, std, min, max.
    """
    return {
        "shape": Z.shape,
        "mean":  float(np.mean(Z)),
        "std":   float(np.std(Z)),
        "min":   float(np.min(Z)),
        "max":   float(np.max(Z)),
    }
