"""
websocket.py (routes)
---------------------
WebSocket endpoint.

Author: Davide91-Git
"""

import json
import numpy as np
import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.stock import get_latest_price, compute_historical_volatility, resolve_window
from app.services.random_generator import generate_standard_normals
from app.services.gbm import simulate_gbm
from app.services.payoff import european_payoff, asian_payoff
from app.services.black_scholes import black_scholes_price

router = APIRouter()

PAYOFF_MAP = {
    "european": european_payoff,
    "asian": asian_payoff,
}

BATCH_SIZE = 5_000


@router.websocket("/ws/convergence")
async def convergence_stream(ws: WebSocket):
    await ws.accept()
    db: Session = next(get_db())

    try:
        raw = await ws.receive_text()
        params = json.loads(raw)

        # ── Resolve S0 from DB ────────────────────────────────
        ticker = params["ticker"]
        S0 = get_latest_price(db, ticker)
        if S0 is None:
            await ws.send_json({"error": f"Ticker '{ticker}' not found"})
            return
        
        # ── Resolve sigma ─────────────────────────────────────
        T = float(params["maturity_years"])
        window = params.get("volatility_window", "match_maturity")
        window_days = resolve_window(window, T)
        sigma = params.get("sigma_override") or compute_historical_volatility(
            db, 
            ticker, 
            window_days=window_days
        )

        if sigma is None:
            await ws.send_json({"error": f"Not enough data for '{ticker}'"})
            return

        
        # ── Pricing parameters ────────────────────────────────
        K = float(params["strike"])
        r = float(params.get("risk_free_rate", 0.045))
        n_total = int(params.get("n_simulations", 100_000))
        n_steps = int(params.get("n_steps", 252))
        option_type = params["option_type"]
        option_style = params.get("option_style", "european")
        antithetic = params.get("antithetic", False)
        parallel = bool(params.get("parallel", False))

        payoff_fn = PAYOFF_MAP[option_style]

        # ── B&S benchmark (European only) ─────────────────────
        bs_price = None
        if option_style == "european":
            bs_price = black_scholes_price(
                S0=S0, K=K, r=r, sigma=sigma, T=T, option_type=option_type
            )

        # ── Streaming batches ─────────────────────────────────
        all_discounted = np.array([], dtype=np.float64)
        n_done = 0

        while n_done < n_total:
            batch = min(BATCH_SIZE, n_total - n_done)

            Z = generate_standard_normals(batch, n_steps, antithetic=antithetic)
            S = simulate_gbm(S0, r, sigma, T, Z, parallel=parallel)
            payoffs = payoff_fn(S, K, option_type)
            discounted = np.exp(-r * T) * payoffs

            all_discounted = np.concatenate([all_discounted, discounted])
            n_done = len(all_discounted)

            price = float(np.mean(all_discounted))
            std_err = float(np.std(all_discounted, ddof=1) / np.sqrt(n_done))
            is_done = n_done >= n_total

            await ws.send_json({
                "n": n_done,
                "mc_price": round(price, 6),
                "std_error": round(std_err, 6),
                "ci_lower": round(price - 1.96 * std_err, 6),
                "ci_upper": round(price + 1.96 * std_err, 6),
                "bs_price": round(bs_price, 6) if bs_price is not None else None,
                "elapsed":  0.0,
                "done": is_done,
            })

            await asyncio.sleep(0)

            if is_done:
                break

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        await ws.send_json({"error": str(exc)})
    finally:
        db.close()
