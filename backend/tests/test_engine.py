"""
test_engine.py
--------------
Unit tests for individual engine components:
random_generator, gbm, payoff, pricer.

Author: Davide91-Git
"""

import numpy as np
import pytest

from app.services.random_generator import generate_standard_normals, summary
from app.services.gbm import simulate_gbm
from app.services.payoff import european_payoff, asian_payoff
from app.services.pricer import mc_price


# ── random_generator ────────────────────────────────────────────

class TestRandomGenerator:

    def test_shape(self):
        Z = generate_standard_normals(1000, 252, seed=0)
        assert Z.shape == (1000, 252)

    def test_antithetic_doubles_rows(self):
        Z = generate_standard_normals(500, 10, antithetic=True, seed=0)
        assert Z.shape == (1000, 10)

    def test_antithetic_symmetry(self):
        Z = generate_standard_normals(500, 10, antithetic=True, seed=0)
        np.testing.assert_array_almost_equal(Z[:500], -Z[500:])

    def test_seed_reproducibility(self):
        Z1 = generate_standard_normals(100, 50, seed=99)
        Z2 = generate_standard_normals(100, 50, seed=99)
        np.testing.assert_array_equal(Z1, Z2)

    def test_mean_near_zero(self):
        Z = generate_standard_normals(100_000, 1, seed=0)
        assert abs(np.mean(Z)) < 0.01

    def test_std_near_one(self):
        Z = generate_standard_normals(100_000, 1, seed=0)
        assert abs(np.std(Z) - 1.0) < 0.01

    def test_summary_keys(self):
        Z = generate_standard_normals(100, 10, seed=0)
        s = summary(Z)
        assert set(s.keys()) == {"shape", "mean", "std", "min", "max"}

    def test_invalid_n_simulations(self):
        with pytest.raises(ValueError):
            generate_standard_normals(0, 10)

    def test_invalid_n_steps(self):
        with pytest.raises(ValueError):
            generate_standard_normals(10, -1)


# ── gbm ─────────────────────────────────────────────────────────

class TestGBM:

    def test_output_shape(self, default_params, seed):
        Z = generate_standard_normals(500, 252, seed=seed)
        S = simulate_gbm(Z=Z, **default_params)
        assert S.shape == (500, 253)

    def test_first_column_is_S0(self, default_params, seed):
        Z = generate_standard_normals(100, 50, seed=seed)
        S = simulate_gbm(Z=Z, **default_params)
        np.testing.assert_array_equal(S[:, 0], default_params["S0"])

    def test_prices_positive(self, default_params, seed):
        Z = generate_standard_normals(1000, 252, seed=seed)
        S = simulate_gbm(Z=Z, **default_params)
        assert np.all(S > 0)

    def test_mean_growth_near_drift(self, seed):
        """Over many paths, average terminal price ≈ S0 * exp(r*T)."""
        Z = generate_standard_normals(200_000, 1, seed=seed)
        S = simulate_gbm(S0=100, r=0.05, sigma=0.2, T=1.0, Z=Z)
        expected = 100 * np.exp(0.05)
        actual = np.mean(S[:, -1])
        assert abs(actual - expected) / expected < 0.01

    def test_invalid_S0(self):
        Z = generate_standard_normals(10, 5, seed=0)
        with pytest.raises(ValueError):
            simulate_gbm(S0=-1, r=0.05, sigma=0.2, T=1.0, Z=Z)

    def test_invalid_sigma(self):
        Z = generate_standard_normals(10, 5, seed=0)
        with pytest.raises(ValueError):
            simulate_gbm(S0=100, r=0.05, sigma=0, T=1.0, Z=Z)


# ── payoff ──────────────────────────────────────────────────────

class TestPayoff:

    def _make_paths(self, seed):
        Z = generate_standard_normals(5000, 252, seed=seed)
        return simulate_gbm(S0=100, r=0.05, sigma=0.2, T=1.0, Z=Z)

    def test_european_call_non_negative(self, seed):
        S = self._make_paths(seed)
        payoffs = european_payoff(S, K=105, option_type="call")
        assert np.all(payoffs >= 0)

    def test_european_put_non_negative(self, seed):
        S = self._make_paths(seed)
        payoffs = european_payoff(S, K=105, option_type="put")
        assert np.all(payoffs >= 0)

    def test_asian_call_non_negative(self, seed):
        S = self._make_paths(seed)
        payoffs = asian_payoff(S, K=105, option_type="call")
        assert np.all(payoffs >= 0)

    def test_european_call_payoff_correct(self):
        """Deterministic check: single path ending at 110, K=105 → payoff=5."""
        S = np.array([[100.0, 110.0]])
        assert european_payoff(S, K=105, option_type="call")[0] == 5.0

    def test_european_put_payoff_correct(self):
        """Single path ending at 90, K=105 → payoff=15."""
        S = np.array([[100.0, 90.0]])
        assert european_payoff(S, K=105, option_type="put")[0] == 15.0

    def test_asian_uses_path_average(self):
        """Path: 100, 110, 120 → avg(110, 120) = 115, K=105 → payoff=10."""
        S = np.array([[100.0, 110.0, 120.0]])
        assert asian_payoff(S, K=105, option_type="call")[0] == 10.0

    def test_invalid_strike(self):
        S = np.array([[100.0, 110.0]])
        with pytest.raises(ValueError):
            european_payoff(S, K=-1, option_type="call")

    def test_invalid_option_type(self):
        S = np.array([[100.0, 110.0]])
        with pytest.raises(ValueError):
            european_payoff(S, K=100, option_type="straddle")


# ── pricer ──────────────────────────────────────────────────────

class TestPricer:

    def test_returns_dataclass(self, default_params):
        result = mc_price(
            **default_params,
            n_simulations=1000, n_steps=50,
            payoff_fn=european_payoff, option_type="call", seed=42,
        )
        assert hasattr(result, "price")
        assert hasattr(result, "std_error")
        assert hasattr(result, "ci_lower")
        assert hasattr(result, "ci_upper")
        assert hasattr(result, "n_simulations")
        assert hasattr(result, "elapsed_seconds")

    def test_price_positive_for_atm_call(self, default_params):
        result = mc_price(
            **default_params,
            n_simulations=10_000, n_steps=252,
            payoff_fn=european_payoff, option_type="call", seed=42,
        )
        assert result.price > 0

    def test_ci_contains_price(self, default_params):
        result = mc_price(
            **default_params,
            n_simulations=50_000, n_steps=252,
            payoff_fn=european_payoff, option_type="call", seed=42,
        )
        assert result.ci_lower <= result.price <= result.ci_upper

    def test_antithetic_reduces_variance(self, default_params):
        plain = mc_price(
            **default_params,
            n_simulations=50_000, n_steps=252,
            payoff_fn=european_payoff, option_type="call", seed=42,
            antithetic=False,
        )
        anti = mc_price(
            **default_params,
            n_simulations=50_000, n_steps=252,
            payoff_fn=european_payoff, option_type="call", seed=42,
            antithetic=True,
        )
        assert anti.std_error < plain.std_error