/* ============================================================
   components/config/StockSelector.tsx
   Fetches the 30 DJIA tickers from GET /api/v1/tickers on
   mount, renders a searchable select, and shows last price
   and historical σ for the selected stock.
   ============================================================ */

import { useEffect, useState } from 'react';
import { useLanguage }         from '../../context/LanguageContext';
import styles                  from './StockSelector.module.css';

/* ── Types ──────────────────────────────────────────────────── */
interface TickerInfo {
  ticker:               string;
  company_name:         string;
  sector:               string;
  last_price:           number;
  historical_volatility: number;
}

interface Props {
  value:      string;
  onChange:   (ticker: string) => void;
  onS0Change: (s0: number)    => void;
}

/* ── Helpers ────────────────────────────────────────────────── */
function fmt(n: number, decimals = 2) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ── Component ──────────────────────────────────────────────── */
export default function StockSelector({ value, onChange, onS0Change }: Props) {
  const { t } = useLanguage();
  const [tickers, setTickers] = useState<TickerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/tickers`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch tickers');
        return r.json() as Promise<TickerInfo[]>;
      })
      .then(data => { setTickers(data); setLoading(false); })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, []);

  const selected = tickers.find(t => t.ticker === value) ?? null;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const ticker = e.target.value;
    onChange(ticker);
    const info = tickers.find(t => t.ticker === ticker);
    if (info) onS0Change(info.last_price);
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{t.config.stock}</label>

      <select
        className={styles.select}
        value={value}
        onChange={handleChange}
        disabled={loading || fetchError}
      >
        <option value="" disabled>
          {loading
            ? 'Loading…'
            : fetchError
              ? 'Unavailable'
              : t.config.stockPlaceholder}
        </option>
        {tickers.map(info => (
          <option key={info.ticker} value={info.ticker}>
            {info.ticker} — {info.company_name}
          </option>
        ))}
      </select>

      {/* Selected stock metadata */}
      {selected && (
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t.config.lastPrice}</span>
            <span className={styles.metaValue}>${fmt(selected.last_price)}</span>
          </div>
          <div className={styles.metaDivider} />
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t.config.historicalVol}</span>
            <span className={styles.metaValue}>
              {fmt(selected.historical_volatility * 100, 1)}%
            </span>
          </div>
          <div className={styles.metaDivider} />
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Sector</span>
            <span className={`${styles.metaValue} ${styles.metaSector}`}>
              {selected.sector}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}