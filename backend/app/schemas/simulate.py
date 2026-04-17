"""
simulate.py
---------------------
Pydantic models request and response validation.

Author: Davide91-Git
"""

from pydantic import BaseModel, Field


class PricingRequest(BaseModel):
    ticker: str = Field(..., example="AAPL")
    strike: float = Field(..., gt=0, example=150.0)
    maturity_years: float = Field(..., gt=0, le=5.0, example=1.0)
    risk_free_rate: float = Field(default=0.045, ge=0, le=0.3, example=0.045)
    n_simulations: int = Field(default=100_000, ge=1_000, le=5_000_000)
    n_steps: int = Field(default=252, ge=1, le=504)
    option_type: str = Field(..., pattern="^(call|put)$", example="call")
    option_style: str = Field(default="european", pattern="^(european|asian)$")
    antithetic: bool = Field(default=False)
    volatility_window: str = Field(
        default="match_maturity",
        pattern="^(1M|3M|6M|1Y|3Y|match_maturity)$"
    )
    sigma_override: float | None = Field(default=None, gt=0, le=3.0)


class TickerInfo(BaseModel):
    ticker: str
    company_name: str
    sector: str | None
    last_price: float | None
    historical_volatility: float | None


class PricingResponse(BaseModel):
    mc_price: float
    std_error: float
    ci_lower: float
    ci_upper: float
    bs_price: float | None
    n_simulations: int
    elapsed_seconds: float
    inputs: dict
