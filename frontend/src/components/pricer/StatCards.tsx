/* ============================================================
   components/pricer/StatCards.tsx
   Three metric cards updated live with each batch.

   During simulation: shows latest batch values (updating live).
   After completion:  shows final result with elapsed time.
   B&S card is hidden for Asian options (no closed-form exists).
   ============================================================ */

import { useLanguage } from '../../context/LanguageContext';
import type { ConvergencePoint, PricingResult } from '../../hooks/useConvergence';
import styles from './StatCards.module.css';

/* ── Single card ────────────────────────────────────────────── */
interface CardProps {
  label:     string;
  value:     string;
  sub?:      string;
  variant?:  'default' | 'accent' | 'positive' | 'negative';
}

function Card({ label, value, sub, variant = 'default' }: CardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */
function fmtPrice(n: number): string {
  return `$${n.toFixed(4)}`;
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${(n * 100).toFixed(3)}%`;
}

function bsVariant(diff: number): 'positive' | 'negative' | 'default' {
  if (Math.abs(diff) < 0.001) return 'default';
  return diff >= 0 ? 'positive' : 'negative';
}

/* ── Props ──────────────────────────────────────────────────── */
interface Props {
  point:  ConvergencePoint;          /* latest batch  */
  result: PricingResult | null;      /* final result  */
}

/* ── Component ──────────────────────────────────────────────── */
export default function StatCards({ point, result }: Props) {
  const { t } = useLanguage();

  /* CI from the latest point */
  const ci = `[${fmtPrice(point.ciLow)} – ${fmtPrice(point.ciHigh)}]`;

  /* B&S comparison — only when available */
  const hasBs     = point.bsPrice !== null;
  const bsDiff    = hasBs ? (point.mcPrice - point.bsPrice!) / point.bsPrice! : 0;
  const bsVariantName = hasBs ? bsVariant(bsDiff) : 'default';

  /* Elapsed — only after completion */
  const elapsedSub = result
    ? `${result.elapsed.toFixed(2)}s elapsed`
    : undefined;

  return (
    <div className={styles.grid}>
      <Card
        label={t.results.mcPrice}
        value={fmtPrice(point.mcPrice)}
        sub={ci}
        variant="accent"
      />

      <Card
        label={t.results.stdError}
        value={`±${point.se.toFixed(4)}`}
        sub={elapsedSub}
      />

      {hasBs ? (
        <Card
          label={t.results.vsBs}
          value={fmtPct(bsDiff)}
          sub={`B&S ${fmtPrice(point.bsPrice!)}`}
          variant={bsVariantName}
        />
      ) : (
        <Card
          label={t.results.vsBs}
          value={t.results.notAvailable}
          sub="Asian option"
        />
      )}
    </div>
  );
}