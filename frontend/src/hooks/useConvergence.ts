/* ============================================================
   hooks/useConvergence.ts
   Manages the WebSocket connection to the MC pricing engine.

   LIFECYCLE:
     1. run(config)  → opens WS, sends params, listens for batches
     2. Each message → appends a point to `points[]`
     3. done=true    → marks status 'done', closes WS cleanly
     4. stop()       → manual close (user cancels)
     5. Cleanup      → if the component unmounts mid-run,
                       the WS is closed so no memory leaks
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PricingConfig } from '../components/config/ConfigPanel';

/* ── Types ──────────────────────────────────────────────────── */

/* One data point per batch received from the server */
export interface ConvergencePoint {
  n:        number;          /* cumulative paths simulated so far */
  mcPrice:  number;          /* MC price estimate at this batch   */
  se:       number;          /* standard error                    */
  ciLow:    number;          /* 95% CI lower bound                */
  ciHigh:   number;          /* 95% CI upper bound                */
  bsPrice:  number | null;   /* B&S benchmark (European only)     */
}

/* Final aggregated result (last message from server) */
export interface PricingResult {
  mcPrice:  number;
  se:       number;
  ciLow:    number;
  ciHigh:   number;
  bsPrice:  number | null;
  elapsed:  number;          /* seconds */
  n:        number;          /* total paths */
}

export type SimStatus =
  | 'idle'
  | 'connecting'
  | 'running'
  | 'done'
  | 'error';

/* Shape of each JSON message the server sends */
interface ServerMessage {
  n:         number;
  mc_price:  number;
  std_error: number;
  ci_lower:  number;
  ci_upper:  number;
  bs_price:  number | null;
  elapsed:   number;
  done:      boolean;
}

/* What the hook exposes to components */
export interface ConvergenceState {
  status:     SimStatus;
  points:     ConvergencePoint[];
  result:     PricingResult | null;
  totalPaths: number;
  run:        (config: PricingConfig) => void;
  stop:       () => void;
}

/* ── Constants ──────────────────────────────────────────────── */
const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/api/v1/ws/convergence';

/* ── Hook ───────────────────────────────────────────────────── */
export function useConvergence(): ConvergenceState {
  const [status, setStatus]     = useState<SimStatus>('idle');
  const [points, setPoints]     = useState<ConvergencePoint[]>([]);
  const [result, setResult]     = useState<PricingResult | null>(null);
  const [totalPaths, setTotalPaths] = useState(0);

  /* Stable ref to the live WebSocket — does not cause re-renders */
  const wsRef = useRef<WebSocket | null>(null);

  /* ── Cleanup helper ─────────────────────────────────────────
     Closes the socket if open and nulls the ref.
     Called on: stop(), error, unmount.
  ── */
  const closeSocket = useCallback(() => {
    if (wsRef.current) {
      /* Only close if not already closing/closed */
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  /* ── Unmount cleanup ────────────────────────────────────────
     If the component using this hook unmounts while a
     simulation is running, close the socket to avoid leaks.
  ── */
  useEffect(() => {
    return () => { closeSocket(); };
  }, [closeSocket]);

  /* ── run ────────────────────────────────────────────────────
     Opens the WebSocket and starts streaming.
     Guards against double-open (StrictMode / accidental double call).
  ── */
  const run = useCallback((config: PricingConfig) => {
    /* Guard: don't open if already active */
    if (status === 'connecting' || status === 'running') return;

    /* Reset state for a fresh simulation */
    setPoints([]);
    setResult(null);
    setTotalPaths(config.simulations);
    setStatus('connecting');

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    /* ── onopen: connection established → send params ─────── */
    ws.onopen = () => {
      setStatus('running');

      /* Build the payload matching PricingRequest on the backend */
      const payload = {
        ticker:         config.ticker,
        option_style:   config.optionStyle,
        option_type:    config.optionType,
        strike:         config.strike,
        maturity_years: config.maturity,
        risk_free_rate: config.riskFreeRate,
        n_simulations:  config.simulations,
        n_steps:        config.steps,
        vol_window:     config.volMode === 'auto' ? config.volWindow : null,
        sigma_override: config.volMode === 'manual' ? config.sigmaOverride : null,
        antithetic:     config.antithetic,
      };

      ws.send(JSON.stringify(payload));
    };

    /* ── onmessage: server sends a batch result ───────────── */
    ws.onmessage = (event: MessageEvent) => {
      let msg: ServerMessage;

      try {
        msg = JSON.parse(event.data as string) as ServerMessage;
      } catch {
        /* Malformed message — log and skip */
        console.warn('[useConvergence] Failed to parse message:', event.data);
        return;
      }

      /* Convert snake_case server fields to camelCase point */
      const point: ConvergencePoint = {
        n:       msg.n,
        mcPrice: msg.mc_price,
        se:      msg.std_error,
        ciLow:   msg.ci_lower,
        ciHigh:  msg.ci_upper,
        bsPrice: msg.bs_price,
      };

      /* Append the new point — functional update avoids stale closure */
      setPoints(prev => [...prev, point]);

      /* If this is the final batch, save the result and close */
      if (msg.done) {
        setResult({
          mcPrice: msg.mc_price,
          se:      msg.std_error,
          ciLow:   msg.ci_lower,
          ciHigh:  msg.ci_upper,
          bsPrice: msg.bs_price,
          elapsed: msg.elapsed,
          n:       msg.n,
        });
        setStatus('done');
        closeSocket();
      }
    };

    /* ── onerror ──────────────────────────────────────────── */
    ws.onerror = () => {
      setStatus('error');
      closeSocket();
    };

    /* ── onclose ──────────────────────────────────────────── */
    ws.onclose = (event: CloseEvent) => {
      /* Normal closure (code 1000) after done=true is expected.
         Any other code means something went wrong. */
      if (event.code !== 1000 && status !== 'done') {
        setStatus('error');
      }
      wsRef.current = null;
    };
  }, [status, closeSocket]);

  /* ── stop ───────────────────────────────────────────────────
     Manual cancellation by the user.
  ── */
  const stop = useCallback(() => {
    closeSocket();
    setStatus('idle');
  }, [closeSocket]);

  return { status, points, result, totalPaths, run, stop };
}