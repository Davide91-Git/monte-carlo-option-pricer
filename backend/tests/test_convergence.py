"""
test_convergence.py
-------------------
Validates that the Monte Carlo engine converges to Black-Scholes
analytical prices for European options.

This is the core validation of the engine: if these tests pass,
the GBM simulation, payoff computation, and discounting are correct.

Author: Davide91-Git
"""

import pytest
from app.services.pricer import mc_price
from app.services.payoff import european_payoff
from app.services.black_scholes import black_scholes_price


N_SIMS = 500_000
N_STEPS = 252
TOLERANCE = 0.01  # 1% relative error


class TestConvergence:
    """MC price must converge to B&S within TOLERANCE for European options."""

    @pytest.mark.parametrize("option_type", ["call", "put"])
    def test_atm(self, option_type):
        """At-the-money: S0 == K."""
        params = {"S0": 100, "K": 100, "r": 0.05, "sigma": 0.2, "T": 1.0}
        self._assert_convergence(params, option_type)

    @pytest.mark.parametrize("option_type", ["call", "put"])
    def test_itm(self, option_type):
        """In-the-money: call K < S0, put K > S0."""
        K = 90 if option_type == "call" else 110
        params = {"S0": 100, "K": K, "r": 0.05, "sigma": 0.2, "T": 1.0}
        self._assert_convergence(params, option_type)

    @pytest.mark.parametrize("option_type", ["call", "put"])
    def test_otm(self, option_type):
        """Out-of-the-money: call K > S0, put K < S0."""
        K = 110 if option_type == "call" else 90
        params = {"S0": 100, "K": K, "r": 0.05, "sigma": 0.2, "T": 1.0}
        self._assert_convergence(params, option_type)

    @pytest.mark.parametrize("option_type", ["call", "put"])
    def test_high_volatility(self, option_type):
        """sigma = 0.5 to stress-test the engine."""
        params = {"S0": 100, "K": 100, "r": 0.05, "sigma": 0.5, "T": 1.0}
        self._assert_convergence(params, option_type)

    @pytest.mark.parametrize("option_type", ["call", "put"])
    def test_short_maturity(self, option_type):
        """T = 0.1 (roughly 1 month)."""
        params = {"S0": 100, "K": 100, "r": 0.05, "sigma": 0.2, "T": 0.1}
        self._assert_convergence(params, option_type)

    @pytest.mark.parametrize("option_type", ["call", "put"])
    def test_long_maturity(self, option_type):
        """T = 3 years."""
        params = {"S0": 100, "K": 100, "r": 0.05, "sigma": 0.2, "T": 3.0}
        self._assert_convergence(params, option_type)

    @pytest.mark.parametrize("option_type", ["call", "put"])
    def test_antithetic(self, option_type):
        """Convergence still holds with antithetic variance reduction."""
        params = {"S0": 100, "K": 105, "r": 0.05, "sigma": 0.2, "T": 1.0}
        self._assert_convergence(params, option_type, antithetic=True)

    def _assert_convergence(self, params, option_type, antithetic=False):
        bs = black_scholes_price(**params, option_type=option_type)

        mc = mc_price(
            **params,
            n_simulations=N_SIMS,
            n_steps=N_STEPS,
            payoff_fn=european_payoff,
            option_type=option_type,
            antithetic=antithetic,
            seed=42,
        )

        relative_error = abs(mc.price - bs) / bs
        assert relative_error < TOLERANCE, (
            f"{option_type} | MC={mc.price:.4f} BS={bs:.4f} "
            f"err={relative_error:.4%} (limit={TOLERANCE:.0%})"
        )

        # B&S price must fall within the MC confidence interval
        assert mc.ci_lower <= bs <= mc.ci_upper, (
            f"{option_type} | BS={bs:.4f} outside CI [{mc.ci_lower:.4f}, {mc.ci_upper:.4f}]"
        )