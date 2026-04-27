/* ============================================================
   components/charts/ConvergenceChart.tsx

   Shows the Monte Carlo price converging toward the B&S
   benchmark as the number of simulated paths increases.

   WHAT IS RENDERED:
     • MC price line       — updates live with each batch
     • 95% CI band         — area between ciLow and ciHigh,
                             shrinks as N grows (1/√N rate)
     • B&S benchmark line  — flat dashed line (European only)

   WHY isAnimationActive={false}:
     Recharts animates each data point on mount by default.
     With live streaming data, this would replay the animation
     on every new batch, causing a jarring "reset" effect.
     We disable it and let the natural line extension serve
     as the animation instead.

   CSS VARIABLES IN RECHARTS:
     Recharts renders SVG elements directly. To use CSS
     variables we read them at render time via
     getComputedStyle(document.documentElement). This is the
     only safe way — inline SVG doesn't inherit CSS vars.
   ============================================================ */

import {
  ComposedChart,
  Line,
  Area,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect }         from 'react';
import { useLanguage }     from '../../context/LanguageContext';
import { useTheme }        from '../../context/ThemeContext';
import type { ConvergencePoint } from '../../hooks/useConvergence';
import styles from './ConvergenceChart.module.css';

/* ── Props ──────────────────────────────────────────────────── */
interface Props {
  points:     ConvergencePoint[];
  totalPaths: number;
  isRunning:  boolean;
}

/* ── Read CSS token at render time ──────────────────────────── */
function token(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/* ── Chart data shape ───────────────────────────────────────── */
interface ChartRow {
  n:       number;
  mc:      number;
  ciLow:   number;
  ciHigh:  number;
  bs:      number | null;
  ciRange: [number, number];   /* for Area — [low, high] */
}

/* ── Custom tooltip ─────────────────────────────────────────── */
function CustomTooltip({ active, payload }: {
  active?:  boolean;
  payload?: { name: string; value: number; color: string }[];
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.tooltip}>
      {payload.map(p => (
        p.value != null && (
          <div key={p.name} className={styles.tooltipRow}>
            <span className={styles.tooltipDot} style={{ background: p.color }} />
            <span className={styles.tooltipLabel}>{p.name}</span>
            <span className={styles.tooltipValue}>${p.value.toFixed(4)}</span>
          </div>
        )
      ))}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function ConvergenceChart({ points, isRunning }: Props) {
  const { t } = useLanguage();
  
  const { isDark } = useTheme();

  /* Resolve CSS tokens once per render */
  const [colors, setColors] = useState(() => ({
    mc:     token('--chart-mc-line'),
    bs:     token('--chart-bs-line'),
    ci:     token('--chart-ci-band'),
    grid:   token('--chart-grid'),
    text:   token('--color-text-muted'),
  })); 
  // Re-read on each render so dark/light toggle updates the chart

  useEffect(() => {
  const timer = setTimeout(() => {
    setColors({
      mc:   token('--chart-mc-line'),
      bs:   token('--chart-bs-line'),
      ci:   token('--chart-ci-band'),
      grid: token('--chart-grid'),
      text: token('--color-text-muted'),
    });
  }, 0);
  return () => clearTimeout(timer);
}, [isDark]);

  /* Transform ConvergencePoint[] into Recharts-friendly rows */
  const data: ChartRow[] = points.map(p => ({
    n:       Math.round(p.n / 1000),   /* x-axis in thousands */
    mc:      p.mcPrice,
    ciLow:   p.ciLow,
    ciHigh:  p.ciHigh,
    bs:      p.bsPrice,
    ciRange: [p.ciLow, p.ciHigh],
  }));

  /* B&S value for the reference line (last point, or null) */
  const bsValue = points.length > 0
    ? points[points.length - 1].bsPrice
    : null;

  /* Y-axis domain: pad ±10% around the data range */
  const allValues = points.flatMap(p => [p.mcPrice, p.ciLow, p.ciHigh]);
  const yMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const yMax = allValues.length > 0 ? Math.max(...allValues) : 1;
  const pad  = (yMax - yMin) * 0.15 || 0.5;

  return (
    <div className={styles.wrapper}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <h3 className={styles.title}>{t.charts.convergenceTitle}</h3>
        <span className={styles.subtitle}>
          {t.charts.convergenceSubtitle.replace(
            '{n}',
            points.length > 0
              ? points[points.length - 1].n.toLocaleString()
              : '0',
          )}
        </span>
        {isRunning && <span className={styles.liveBadge}>LIVE</span>}
      </div>

      {/* ── Chart ── */}
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>

          {/* Grid */}
          <CartesianGrid
            stroke={colors.grid}
            strokeDasharray="0"
            vertical={false}
          />

          {/* Axes */}
          <XAxis
            dataKey="n"
            tick={{ fontSize: 11, fill: colors.text, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            label={{
              value: t.charts.xAxisLabel,
              position: 'insideBottom',
              offset: -2,
              fontSize: 11,
              fill: colors.text,
            }}
            tickFormatter={(v: number) => `${v}k`}
          />
          <YAxis
            tick={{ fontSize: 11, fill: colors.text, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            domain={[yMin - pad, yMax + pad]}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            width={64}
            label={{
              value: t.charts.yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              offset: 0,
              fontSize: 10,
              fill: colors.text,
            }}
          />

          {/* Tooltip */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: colors.grid, strokeWidth: 1 }}
          />

          {/* Legend */}
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
            formatter={(value: string) => (
              <span style={{ color: colors.text, fontFamily: 'var(--font-ui)' }}>
                {value}
              </span>
            )}
          />

          {/* CI band — rendered as an Area between ciLow and ciHigh */}
          <Area
            type="monotone"
            dataKey="ciHigh"
            stroke="none"
            fill={colors.ci}
            fillOpacity={1}
            legendType="none"
            isAnimationActive={false}
            name="ciHigh"
            tooltipType="none"
          />
          <Area
            type="monotone"
            dataKey="ciLow"
            stroke="none"
            fill={colors.ci}
            fillOpacity={1}
            legendType="square"
            isAnimationActive={false}
            name={t.charts.ciBand}
          />

          {/* MC price line */}
          <Line
            type="monotone"
            dataKey="mc"
            stroke={colors.mc}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
            name={t.charts.mcLine}
          />

          {/* B&S benchmark — flat dashed reference line */}
          {bsValue !== null && (
            <ReferenceLine
              y={bsValue}
              stroke={colors.bs}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              label={{
                value: `B&S $${bsValue.toFixed(2)}`,
                position: 'insideTopRight',
                fontSize: 10,
                fill: colors.bs,
                fontFamily: 'var(--font-mono)',
              }}
            />
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}