/* ============================================================
   components/charts/PriceHistory.tsx

   Shows the historical price series for the selected stock
   over the volatility window chosen in ConfigPanel.

   WHAT IS RENDERED:
     • Price line     — adj_close daily series
     • S₀ dot         — last point highlighted (start of simulation)
     • Strike K line  — horizontal dashed reference with ITM/OTM label
     • σ annual       — shown as a number in the header, not as a band

   PROPS:
     ticker      — selected stock symbol
     windowDays  — number of trading days to show (from vol window)
     strike      — K value from ConfigPanel (0 = not set yet)
   ============================================================ */

import {
  ComposedChart,
  Area,
  ReferenceLine,
  ReferenceDot,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect } from 'react'
import { useLanguage }         from '../../context/LanguageContext';
import { usePriceHistory }     from '../../hooks/usePriceHistory';
import { useTheme }            from '../../context/ThemeContext';
import styles                  from './PriceHistory.module.css';



/* ── Props ──────────────────────────────────────────────────── */
interface Props {
  ticker:     string;
  companyName: string;
  windowDays: number;
  strike:     number;
}

/* ── Read CSS token ─────────────────────────────────────────── */
function token(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/* ── Custom tooltip ─────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: {
  active?:  boolean;
  payload?: { value: number }[];
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipDate}>{label}</span>
      <span className={styles.tooltipPrice}>
        ${payload[0].value.toFixed(2)}
      </span>
    </div>
  );
}

/* ── ITM / OTM label ────────────────────────────────────────── */
function moneyness(s0: number, strike: number): string {
  if (strike <= 0) return '';
  const itm = s0 > strike;
  const pct = Math.abs((s0 - strike) / strike * 100).toFixed(1);
  return itm ? `ITM ${pct}%` : `OTM ${pct}%`;
}

/* ── Main component ─────────────────────────────────────────── */
export default function PriceHistory({ ticker, companyName, windowDays, strike }: Props) {
  const { t }               = useLanguage();
  const { status, history } = usePriceHistory(ticker, windowDays);

  const { isDark } = useTheme();

const [colors, setColors] = useState(() => ({
  price:  token('--color-accent'),
  strike: token('--color-gold'),
  s0:     token('--color-positive'),
  grid:   token('--chart-grid'),
  text:   token('--color-text-muted'),
  fill:   token('--color-accent'),
}));

useEffect(() => {
  const timer = setTimeout(() => {
    setColors({
      price:  token('--color-accent'),
      strike: token('--color-gold'),
      s0:     token('--color-positive'),
      grid:   token('--chart-grid'),
      text:   token('--color-text-muted'),
      fill:   token('--color-accent'),
    });
  }, 0);
  return () => clearTimeout(timer);
}, [isDark]);

  /* ── Empty / loading / error states ── */
  if (!ticker) {
    return (
      <div className={styles.placeholder}>
        {t.charts.historyEmpty}
      </div>
    );
  }

  if (status === 'loading') {
    return <div className={styles.placeholder}>Loading…</div>;
  }

  if (status === 'error' || !history) {
    return (
      <div className={styles.placeholder}>
        {t.errors.genericError}
      </div>
    );
  }

  const { points, s0, sigmaAnnual } = history;
  const lastPoint = points[points.length - 1];

  /* Y-axis domain with 8% padding, includes strike if set */
  const closes = points.map(p => p.close);
  const yMin   = Math.min(...closes, strike > 0 ? strike : Infinity);
  const yMax   = Math.max(...closes, strike > 0 ? strike : -Infinity);
  const pad    = (yMax - yMin) * 0.08 || 1;

  /* X-axis tick every ~6 labels */
  const tickInterval = Math.max(1, Math.floor(points.length / 6));
  const gradientId = `priceGradient-${isDark ? 'dark' : 'light'}`;

  return (
    <div className={styles.wrapper}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>
            {t.charts.historyTitle}- {companyName || ticker}
          </h3>
          <span className={styles.subtitle}>
            {t.charts.historySubtitle
              .replace('{days}', String(windowDays))}
          </span>
        </div>

        <div className={styles.headerRight}>
          {/* σ annualised — the direct GBM parameter */}
          <div className={styles.sigmaChip}>
              σ {(sigmaAnnual * 100).toFixed(1)}% ann.
          </div>

          {/* ITM / OTM badge */}
          {strike > 0 && (
            <div className={`
              ${styles.moneynessChip}
              ${s0 > strike ? styles.itm : styles.otm}
            `}>
              {moneyness(s0, strike)}
            </div>
          )}
        </div>
      </div>

      {/* ── Chart ── */}
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart
          data={points}
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={colors.fill} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.fill} stopOpacity={0} />
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"></linearGradient>
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke={colors.grid}
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: colors.text, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
            tickFormatter={(d: string) => d.slice(5)}
            label={{
              value: 'Date',
              position: 'insideBottom',
              offset: -2,
              fontSize: 10,
              fill: colors.text,
              fontFamily: 'var(--font-mono)',
            }}
          />

          <YAxis
            tick={{ fontSize: 10, fill: colors.text, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            domain={[yMin - pad, yMax + pad]}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
            width={52}
             label={{
              value: 'Price (USD)',
              angle: -90,
              position: 'insideLeft',
              offset: 0,
              fontSize: 10,
              fill: colors.text,
              fontFamily: 'var(--font-mono)',
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Price line */}
          <Area
            type="monotone"
            dataKey="close"
            stroke={colors.price}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
            isAnimationActive={false}
            name={ticker}
          />

          {/* S₀ dot — today's price, start of simulation */}
          {lastPoint && (
            <ReferenceDot
              x={lastPoint.date}
              y={lastPoint.close}
              r={5}
              fill={colors.s0}
              stroke="var(--color-surface)"
              strokeWidth={2}
              label={{
                value: `S₀  $${lastPoint.close.toFixed(2)}`,
                position: 'insideTopRight',
                fontSize: 10,
                fill: colors.s0,
                fontFamily: 'var(--font-mono)',
              }}
            />
          )}

          {/* Strike K — only when user has set a value */}
          {strike > 0 && (
            <ReferenceLine
              y={strike}
              stroke={colors.strike}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              label={{
                value: `K  $${strike.toFixed(2)}`,
                position: 'insideTopLeft',
                fontSize: 10,
                fill: colors.strike,
                fontFamily: 'var(--font-mono)',
              }}
            />
          )}

        </ComposedChart>
      </ResponsiveContainer>

      {/* ── Footer meta row ── */}
      <div className={styles.footer}>
        <span className={styles.metaItem}>
          {t.charts.historyS0Label}&nbsp;
          <strong>${s0.toFixed(2)}</strong>
        </span>
        {strike > 0 && (
          <span className={styles.metaItem}>
            {t.charts.historyStrikeLabel}&nbsp;
            <strong>${strike.toFixed(2)}</strong>
          </span>
        )}
        <span className={styles.metaItem}>
          {points[0]?.date} → {lastPoint?.date}
        </span>
      </div>

    </div>
  );
}