"""
simulate.py
--------------------
REST endpoints for option pricing and stock data.

Author: Davide91-Git
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.stock import get_all_tickers, get_latest_price, compute_historical_volatility, resolve_window
from app.schemas.simulate import PricingRequest, PricingResponse, TickerInfo
from app.services.pricer import mc_price
from app.services.payoff import european_payoff, asian_payoff
from app.services.black_scholes import black_scholes_price

router = APIRouter()

PAYOFF_MAP = {
    "european": european_payoff,
    "asian": asian_payoff,
}


@router.get("/tickers", response_model=list[TickerInfo])
def list_tickers(db: Session = Depends(get_db)):
    """Return all available tickers with latest price and volatility."""
    tickers = get_all_tickers(db)
    result = []
    for t in tickers:
        result.append(
            TickerInfo(
                ticker=t["ticker"],
                company_name=t["company_name"],
                sector=t["sector"],
                last_price=get_latest_price(db, t["ticker"]),
                historical_volatility=compute_historical_volatility(db, t["ticker"]),
            )
        )
    return result


@router.post("/price", response_model=PricingResponse)
def run_pricing(req: PricingRequest, db: Session = Depends(get_db)):
    """Run Monte Carlo pricing for the given parameters."""
    S0 = get_latest_price(db, req.ticker)
    if S0 is None:
        raise HTTPException(status_code=404, detail=f"Ticker '{req.ticker}' not found")

    window_days = resolve_window(req.volatility_window, req.maturity_years)
    sigma = req.sigma_override or compute_historical_volatility(db, req.ticker, window_days=window_days)
    if sigma is None:
        raise HTTPException(
            status_code=400, 
            detail=f"Not enough data to compute volatility for '{req.ticker}'"
        )

    payoff_fn = PAYOFF_MAP[req.option_style]

    result = mc_price(
        S0=S0,
        K=req.strike,
        r=req.risk_free_rate,
        sigma=sigma,
        T=req.maturity_years,
        n_simulations=req.n_simulations,
        n_steps=req.n_steps,
        payoff_fn=payoff_fn,
        option_type=req.option_type,
        antithetic=req.antithetic,
    )

    # B&S benchmark only for european options
    bs = None
    if req.option_style == "european":
        bs = black_scholes_price(
            S0=S0, K=req.strike, r=req.risk_free_rate,
            sigma=sigma, T=req.maturity_years, option_type=req.option_type,
        )

    return PricingResponse(
        mc_price=result.price,
        std_error=result.std_error,
        ci_lower=result.ci_lower,
        ci_upper=result.ci_upper,
        bs_price=bs,
        n_simulations=result.n_simulations,
        elapsed_seconds=result.elapsed_seconds,
        inputs={
            "ticker": req.ticker,
            "S0": S0,
            "K": req.strike,
            "r": req.risk_free_rate,
            "sigma": sigma,
            "T": req.maturity_years,
            "option_type": req.option_type,
            "option_style": req.option_style,
            "volatility_window": req.volatility_window,
            "window_days_used": window_days,
        },
    )
