"""
prices.py (routes)
------------------
Historical price series endpoint.

Exposes:
    GET /api/v1/prices/{ticker}?window_days=N

Author: Davide91-Git
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.stock import get_price_series, get_all_tickers

router = APIRouter()

@router.get("/prices/{ticker}")
def get_historical_prices(
    ticker:      str,
    window_days: int = Query(default=252, ge=1, le=3780),
    db:          Session = Depends(get_db),
) -> list[dict]:
    """
    Return the last window_days trading days of adj_close for a ticker.
    """

    known = [t["ticker"] for t in get_all_tickers(db)]
    if ticker.upper() not in known:
        raise HTTPException(
            status_code=404,
            detail=f"Ticker '{ticker}' not found.",
        )

    rows = get_price_series(db, ticker=ticker.upper(), start=None, end=None)

    if not rows:
        raise HTTPException(
            status_code=404,
            detail=f"No price data found for '{ticker}'.",
        )

    # Take last N trading days directly — no calendar conversion needed
    return rows[-window_days:]
