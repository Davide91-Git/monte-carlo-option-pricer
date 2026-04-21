/* ============================================================
   components/pricer/PricerMain.tsx

   Orchestrator for the main content area.
   Receives convergence state from AppShell and distributes
   it to the right sub-components. No business logic here —
   only layout decisions: what to show, when to show it.

   RENDER LOGIC:
     idle    → empty state with hint message
     connecting/running → progress bar + live convergence chart
     done    → stat cards + full charts
     error   → error message
   ============================================================ */

import { useLanguage }        from '../../context/LanguageContext';
import type { SimStatus, ConvergencePoint, PricingResult } from '../../hooks/useConvergence';
import StatCards              from './StatCards';
import ConvergenceChart       from '../charts/ConvergenceChart';
import PayoffHistogram        from '../charts/PayoffHistogram';
import SimulationProgress     from './SimulationProgress';
import styles                 from './PricerMain.module.css';

/* ── Props ──────────────────────────────────────────────────── */
interface Props {
  status:     SimStatus;
  points:     ConvergencePoint[];
  result:     PricingResult | null;
  totalPaths: number;
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
        <circle cx="10" cy="10" r="9" stroke="var(--color-negative)" strokeWidth="1.5"/>
        <path d="M10 6v5M10 13.5v.5" stroke="var(--color-negative)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span>{t.progress.error}</span>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function PricerMain({ status, points, result, totalPaths }: Props) {
  const isRunning = status === 'connecting' || status === 'running';
  const hasData   = points.length > 0;
  const isDone    = status === 'done';

  return (
    <div className={styles.wrapper}>

      {/* ── Empty state — nothing has run yet ── */}
      {status === 'idle' && <EmptyState />}

      {/* ── Error state ── */}
      {status === 'error' && <ErrorState />}

      {/* ── Progress bar — shown while running ── */}
      {(isRunning || isDone) && (
        <SimulationProgress
          status={status}
          current={points.length > 0 ? points[points.length - 1].n : 0}
          total={totalPaths}
        />
      )}

      {/* ── Stat cards — shown once at least one batch arrived ── */}
      {hasData && (
        <StatCards
          point={points[points.length - 1]}
          result={isDone ? result : null}
        />
      )}

      {/* ── Convergence chart — shown as soon as data flows ── */}
      {hasData && (
        <div className={styles.card}>
          <ConvergenceChart
            points={points}
            totalPaths={totalPaths}
            isRunning={isRunning}
          />
        </div>
      )}

      {/* ── Payoff histogram — shown only after completion ── */}
      {isDone && points.length > 0 && (
        <div className={styles.card}>
          <PayoffHistogram points={points} />
        </div>
      )}

    </div>
  );
}