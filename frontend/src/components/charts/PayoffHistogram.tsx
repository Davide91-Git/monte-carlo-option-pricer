/* ============================================================
   components/charts/PayoffHistogram.tsx

   Shows an approximated distribution of discounted payoffs.

   WHY APPROXIMATE:
     The WebSocket streams aggregated batch statistics
     (mean, SE, CI) — not raw individual payoffs. To show a
     distribution we reconstruct one from what we know:
       mean  = mcPrice  (the MC price estimate)
       sigma = SE × √N  (std dev of the payoff sample)
     We draw M samples from N(mean, sigma), clamp negatives to 0
     (option payoffs can't be negative), then bucket into a
     histogram. This approximates the true distribution shape
     for near-the-money options.

   FUTURE IMPROVEMENT:
     Add a GET /api/v1/payoff-distribution endpoint that returns
     pre-bucketed histogram data. Replace the approximation here
     with real data. The component API (points prop) stays the same.
   ============================================================ */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useMemo }         from 'react';
import { useLanguage }     from '../../context/LanguageContext';
import type { ConvergencePoint } from '../../hooks/useConvergence';
import styles from './PayoffHistogram.module.css';

/* ── Props ──────────────────────────────────────────────────── */
interface Props {
  points: ConvergencePoint[];
}

/* ── Constants ──────────────────────────────────────────────── */
const N_SAMPLES = 2_000;   /* synthetic samples to draw */
const N_BINS    = 40;      /* histogram buckets          */

/* ── Read CSS token ─────────────────────────────────────────── */
function token(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/* ── Box-Muller normal sampler ──────────────────────────────── */
function sampleNormal(mean: number, std: number): number {
  /* Box-Muller transform: converts two uniform samples to normal */
  const u1 = Math.random();
  const u2 = Math.random();
  const z  = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + std * z;
}

/* ── Build histogram buckets from samples ───────────────────── */
interface Bucket {
  midpoint: number;
  count:    number;
  pct:      number;
}

function buildHistogram(samples: number[]): Bucket[] {
  if (samples.length === 0) return [];

  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const binWidth = (max - min) / N_BINS || 0.01;

  /* Initialise empty buckets */
  const buckets: number[] = Array(N_BINS).fill(0);

  for (const s of samples) {
    const idx = Math.min(
      Math.floor((s - min) / binWidth),
      N_BINS - 1,
    );
    buckets[idx]++;
  }

  return buckets.map((count, i) => ({
    midpoint: min + (i + 0.5) * binWidth,
    count,
    pct: (count / samples.length) * 100,
  }));
}

/* ── Custom tooltip ─────────────────────────────────────────── */
function CustomTooltip({ active, payload }: {
  active?:  boolean;
  payload?: { payload: Bucket }[];
}) {
  if (!active || !payload?.length) return null;
  const b = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>Payoff</span>
        <span className={styles.tooltipValue}>${b.midpoint.toFixed(3)}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>Frequency</span>
        <span className={styles.tooltipValue}>{b.pct.toFixed(1)}%</span>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function PayoffHistogram({ points }: Props) {
  const { t } = useLanguage();

  /* Use the last (most accurate) point */
  const last = points[points.length - 1];

  const { data, mcPrice, bsPrice } = useMemo(() => {
    if (!last) return { data: [], mcPrice: 0, bsPrice: null };

    /* Reconstruct approximate std dev of payoff from SE and N */
    const stdPayoff = last.se * Math.sqrt(last.n);

    /* Draw samples, clamp to 0 (option payoffs ≥ 0) */
    const samples: number[] = [];
    for (let i = 0; i < N_SAMPLES; i++) {
      const s = sampleNormal(last.mcPrice, stdPayoff);
      samples.push(Math.max(0, s));
    }

    return {
      data:    buildHistogram(samples),
      mcPrice: last.mcPrice,
      bsPrice: last.bsPrice,
    };
  }, [last]);

  const colors = {
    bar:  token('--chart-bar-fill'),
    mc:   token('--chart-mc-line'),
    bs:   token('--chart-bs-line'),
    grid: token('--chart-grid'),
    text: token('--color-text-muted'),
  };

  if (data.length === 0) {
    return (
      <p className={styles.empty}>{t.charts.distributionEmpty}</p>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t.charts.distributionTitle}</h3>
        <span className={styles.approxBadge}>approx.</span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
          barCategoryGap="2%"
        >
          <CartesianGrid
            stroke={colors.grid}
            vertical={false}
          />

          <XAxis
            dataKey="midpoint"
            tick={{ fontSize: 10, fill: colors.text, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v.toFixed(1)}`}
            interval="preserveStartEnd"
          />

          <YAxis
            tick={{ fontSize: 10, fill: colors.text, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            dataKey="pct"
            width={40}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.grid }} />

          <Bar
            dataKey="pct"
            fill={colors.bar}
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          />

          {/* MC price reference */}
          <ReferenceLine
            x={data.reduce((best, b) =>
              Math.abs(b.midpoint - mcPrice) < Math.abs(best.midpoint - mcPrice) ? b : best
            ).midpoint}
            stroke={colors.mc}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            label={{
              value: `MC $${mcPrice.toFixed(2)}`,
              position: 'top',
              fontSize: 10,
              fill: colors.mc,
              fontFamily: 'var(--font-mono)',
            }}
          />

          {/* B&S reference — only for European */}
          {bsPrice !== null && (
            <ReferenceLine
              x={data.reduce((best, b) =>
                Math.abs(b.midpoint - bsPrice) < Math.abs(best.midpoint - bsPrice) ? b : best
              ).midpoint}
              stroke={colors.bs}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              label={{
                value: `B&S $${bsPrice.toFixed(2)}`,
                position: 'insideTopRight',
                fontSize: 10,
                fill: colors.bs,
                fontFamily: 'var(--font-mono)',
              }}
            />
          )}

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}