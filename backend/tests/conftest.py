"""
conftest.py
-----------
Shared pytest fixtures.

Author: Davide91-Git
"""

import pytest


@pytest.fixture
def default_params():
    """Standard parameter set for reproducible tests."""
    return {
        "S0": 100.0,
        "K": 105.0,
        "r": 0.05,
        "sigma": 0.2,
        "T": 1.0,
    }


@pytest.fixture
def seed():
    return 42