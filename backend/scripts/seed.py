"""
seed.py
-------
One-time script to populate the database with of the most important firms of 
the Dow Jones Industrial Average and their historical daily prices via Yahoo Finance.

Usage:
    docker compose exec backend python -m scripts.seed

Author: Davide91-Git
"""

import sys
from datetime import date

from sqlalchemy.orm import Session
from yahooquery import Ticker

from app.core.database import engine, SessionLocal, Base
from app.models.stock import Stock, DailyPrice

# DJIA constituents as of 31/12/2025
DJIA_TICKERS = [
    "AAPL", 
    "BA",
    "JNJ",
    "JPM", 
    "XOM", 
    "MCD",
    "MSFT"
]

END_DATE = "2025-12-31"


def fetch_and_store(db: Session, ticker_symbol: str) -> None:
    """Download history for a single ticker and write to the database."""
    yf = Ticker(ticker_symbol)

    # Company profile
    profile = yf.asset_profile.get(ticker_symbol, {})
    company_name = profile.get("longName") or profile.get("shortName") or ticker_symbol
    sector = profile.get("sector")

    stock = Stock(ticker=ticker_symbol, company_name=company_name, sector=sector)
    db.add(stock)
    db.flush()

    # Price history (max available up to END_DATE)
    hist = yf.history(start="1980-01-01", end=END_DATE)

    if hist.empty or isinstance(hist, str):
        print(f"  [WARN] No data for {ticker_symbol}, skipping prices")
        return

    if isinstance(hist.index, __import__("pandas").MultiIndex):
        hist = hist.loc[ticker_symbol]

    count = 0
    for dt, row in hist.iterrows():
        price = DailyPrice(
            stock_id=stock.id,
            date=dt.date() if hasattr(dt, "date") else dt,
            open=float(row["open"]),
            high=float(row["high"]),
            low=float(row["low"]),
            close=float(row["close"]),
            adj_close=float(row.get("adjclose", row["close"])),
            volume=float(row["volume"]),
        )
        db.add(price)
        count += 1

    print(f"  {ticker_symbol}: {company_name} — {count} rows")


def main() -> None:
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = {r.ticker for r in db.query(Stock.ticker).all()}

        for ticker in DJIA_TICKERS:
            if ticker in existing:
                print(f"  {ticker}: already loaded, skipping")
                continue
            try:
                fetch_and_store(db, ticker)
                db.commit()
            except Exception as exc:
                db.rollback()
                print(f"  [ERROR] {ticker}: {exc}", file=sys.stderr)

        total_stocks = db.query(Stock).count()
        total_prices = db.query(DailyPrice).count()
        print(f"\nDone. {total_stocks} stocks, {total_prices} price rows.")

    finally:
        db.close()


if __name__ == "__main__":
    main()