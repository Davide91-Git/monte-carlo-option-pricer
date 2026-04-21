/* ============================================================
   hooks/usePriceHistory.ts
   Fetches the historical price series for a given ticker
   from GET /api/v1/prices/{ticker}?window_days=N

   WHAT IT RETURNS:
     points[]     — { date, close } for the chart line
     s0           — latest adj_close (S₀, start of simulation)
     sigmaAnnual  — annualised volatility computed from log-returns
                    on the same window used for pricing (ddof=1, ×√252)
                    This is the σ parameter fed into the GBM.
   ============================================================ */

import { useEffect, useState } from 'react';

/* ── Types ──────────────────────────────────────────────────── */
export interface PricePoint {
  date:  string;   /* ISO date string — e.g. "2024-03-15" */
  close: number;   /* adj_close                           */
}

export interface PriceHistory {
  points:      PricePoint[];
  s0:          number;   /* last close — S₀ in the GBM         */
  sigmaAnnual: number;   /* annualised vol from log-returns     */
}

type FetchStatus = 'idle' | 'loading' | 'ready' | 'error';

interface HookState {
  status:  FetchStatus;
  history: PriceHistory | null;
  error:   string | null;
}

/* ── Helpers ────────────────────────────────────────────────── */

/* Annualised volatility from adj_close series.
   Matches exactly the formula in crud/stock.py:
     log_returns = diff(log(prices))
     sigma_daily = std(log_returns, ddof=1)
     sigma_annual = sigma_daily * sqrt(252)            */
function computeSigmaAnnual(closes: number[]): number {
  if (closes.length < 2) return 0;

  const logReturns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    logReturns.push(Math.log(closes[i] / closes[i - 1]));
  }

  const n   = logReturns.length;
  const avg = logReturns.reduce((a, b) => a + b, 0) / n;
  const variance =
    logReturns.reduce((sum, r) => sum + (r - avg) ** 2, 0) / (n - 1);

  return Math.sqrt(variance) * Math.sqrt(252);
}

/* ── Hook ───────────────────────────────────────────────────── */
export function usePriceHistory(
  ticker:     string,
  windowDays: number,
): HookState {
  const [state, setState] = useState<HookState>({
    status:  'idle',
    history: null,
    error:   null,
  });

  useEffect(() => {
    if (!ticker) {
      setState({ status: 'idle', history: null, error: null });
      return;
    }

    const controller = new AbortController();
    setState(prev => ({ ...prev, status: 'loading', error: null }));

    const url =
      `${import.meta.env.VITE_API_URL}/prices/${ticker}` +
      `?window_days=${windowDays}`;

    fetch(url, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ date: string; adj_close: number }[]>;
      })
      .then(raw => {
        if (raw.length === 0) {
          setState({ status: 'error', history: null, error: 'No data' });
          return;
        }

        const closes = raw.map(p => p.adj_close);

        const points: PricePoint[] = raw.map(p => ({
          date:  p.date,
          close: p.adj_close,
        }));

        setState({
          status: 'ready',
          error:  null,
          history: {
            points,
            s0:          closes[closes.length - 1],
            sigmaAnnual: computeSigmaAnnual(closes),
          },
        });
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setState({ status: 'error', history: null, error: err.message });
      });

    return () => { controller.abort(); };

  }, [ticker, windowDays]);

  return state;
}
