"""
stock.py (crud)
---------------
Database queries for stocks and daily prices.

Author: Davide91-Git
"""

from datetime import date

import numpy as np
from sqlalchemy.orm import Session

from app.models.stock import Stock, DailyPrice


WINDOWS_DAYS = {
    "1M": 21,
    "3M": 63,
    "6M": 126,
    "1Y": 252,
    "3Y": 756,
}


def resolve_window(window: str, maturity_years: float | None) -> int:
    """Translate a window label into number of trading days."""
    if window == "match_maturity":
        if maturity_years is None:
            return 252
        return max(21, int(maturity_years * 252))
    return WINDOWS_DAYS[window]


def get_all_tickers(db: Session) -> list[dict]:
    """Return all stocks with ticker, name, and sector."""
    rows = db.query(Stock).order_by(Stock.ticker).all()
    return [
        {"ticker": r.ticker, "company_name": r.company_name, "sector": r.sector}
        for r in rows
    ]


def get_latest_price(db: Session, ticker: str) -> float | None:
    """Return the most recent adj_close for a ticker."""
    row = (
        db.query(DailyPrice.adj_close)
        .join(Stock)
        .filter(Stock.ticker == ticker)
        .order_by(DailyPrice.date.desc())
        .first()
    )
    return float(row[0]) if row else None


def get_price_series(
    db: Session,
    ticker: str,
    start: date | None = None,
    end: date | None = None,
) -> list[dict]:
    """Return adj_close time series for a ticker within an optional date range."""
    query = (
        db.query(DailyPrice.date, DailyPrice.adj_close)
        .join(Stock)
        .filter(Stock.ticker == ticker)
    )
    if start:
        query = query.filter(DailyPrice.date >= start)
    if end:
        query = query.filter(DailyPrice.date <= end)

    rows = query.order_by(DailyPrice.date).all()
    return [{"date": r.date.isoformat(), "adj_close": float(r.adj_close)} for r in rows]


def compute_historical_volatility(
    db: Session,
    ticker: str,
    window_days: int = 252,
) -> float | None:
    """
    Annualised volatility from daily log-returns.

    Uses the most recent `window_days` trading days.
    """
    rows = (
        db.query(DailyPrice.adj_close)
        .join(Stock)
        .filter(Stock.ticker == ticker)
        .order_by(DailyPrice.date.desc())
        .limit(window_days + 1)
        .all()
    )
    if len(rows) < 2:
        return None

    prices = np.array([float(r[0]) for r in reversed(rows)])
    log_returns = np.diff(np.log(prices))

    return float(np.std(log_returns, ddof=1) * np.sqrt(252))