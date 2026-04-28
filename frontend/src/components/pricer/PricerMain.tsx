/* ============================================================
   components/pricer/PricerMain.tsx

   Orchestrator for the main content area.
   Receives convergence state + chart config from AppShell.

  RENDER LOGIC:
     Always visible:
       • PriceHistory — appears as soon as a ticker is selected,
                        updates live when window or strike changes
 
     After run:
       • SimulationProgress
       • StatCards
       • ConvergenceChart
       • PayoffHistogram (only when done)
   ============================================================ */

import { useLanguage }        from '../../context/LanguageContext';
import type { 
  SimStatus, 
  ConvergencePoint, 
  PricingResult 
}                             from '../../hooks/useConvergence';
import StatCards              from './StatCards';
import SimulationProgress     from './SimulationProgress';
import ConvergenceChart       from '../charts/ConvergenceChart';
import PayoffHistogram        from '../charts/PayoffHistogram';
import PriceHistory           from '../charts/PriceHistory';
import styles                 from './PricerMain.module.css';

/* ── Props ──────────────────────────────────────────────────── */
interface Props {
  /* Convergence / simulation */
  status:     SimStatus;
  points:     ConvergencePoint[];
  result:     PricingResult | null;
  totalPaths: number;

  /* Chart config — from liveConfig in AppShell */
  ticker:     string;
  companyName: string;
  strike:     number;
  windowDays: number;
}

/* ── Empty state ────────────────────────────────────────────── */
function EmptyState() {
  const { t } = useLanguage();
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path
            d="M8 36 L16 22 L24 27 L32 12 L40 19"
            stroke="var(--color-border-strong)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="40" cy="19" r="3.5" fill="var(--color-accent)" />
        </svg>
      </div>
      <p className={styles.emptyText}>{t.progress.idle}</p>
    </div>
  );
}

/* ── Error state ────────────────────────────────────────────── */
function ErrorState() {
  const { t } = useLanguage();
  return (
    <div className={styles.errorState}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle 
          cx="10" cy="10" r="9" 
          stroke="var(--color-negative)" 
          strokeWidth="1.5"
        />
        <path 
        d="M10 6v5M10 13.5v.5" 
        stroke="var(--color-negative)" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        />
      </svg>
      <span>{t.progress.error}</span>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function PricerMain({ 
  status, 
  points, 
  result, 
  totalPaths,
  ticker,
  companyName,
  strike,
  windowDays, 
}: Props) {
  const isRunning = status === 'connecting' || status === 'running';
  const hasData   = points.length > 0;
  const isDone    = status === 'done';
  const hasRun    = hasData || isDone || isRunning;

  return (
    <div className={styles.wrapper}>

      {/* ── Price history — always shown when ticker is selected ── */}
      {ticker && (
        <div className={styles.card}>
          <PriceHistory
            ticker={ticker}
            companyName={companyName}
            windowDays={windowDays}
            strike={strike}
          />
        </div>
      )}

      {/* ── Empty state — nothing has run yet ── */}
      {!ticker && status === 'idle' && <EmptyState />}

      {/* ── Error state ── */}
      {status === 'error' && <ErrorState />}

      {/* ── Progress bar ── */}
      {hasRun && (
        <SimulationProgress
          status={status}
          current={points.length > 0 ? points[points.length - 1].n : 0}
          total={totalPaths}
        />
      )}

      {/* ── Stat cards ── */}
      {hasData && (
        <StatCards
          point={points[points.length - 1]}
          result={isDone ? result : null}
        />
      )}

      {/* ── Convergence chart ── */}
      {hasData && (
        <div className={styles.card}>
          <ConvergenceChart
            points={points}
            totalPaths={totalPaths}
            isRunning={isRunning}
          />
        </div>
      )}

      {/* ── Payoff histogram ── */}
      {isDone && points.length > 0 && (
        <div className={styles.card}>
          <PayoffHistogram points={points} />
        </div>
      )}

    </div>
  );
}
