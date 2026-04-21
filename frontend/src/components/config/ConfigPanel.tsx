/* ============================================================
   components/config/ConfigPanel.tsx
   Sidebar container. Owns the form state and passes it down
   to StockSelector and OptionForm.
   On submit, calls onRunSimulation (wired to useConvergence
   in PricerMain once that component exists).
   ============================================================ */

import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import StockSelector   from './StockSelector';
import OptionForm      from './OptionForm';
import styles          from './ConfigPanel.module.css';

/* ── Types ──────────────────────────────────────────────────── */
export type OptionStyle = 'european' | 'asian';
export type OptionType  = 'call'     | 'put';
export type VolWindow   = '1M' | '3M' | '6M' | '1Y' | '3Y' | 'match_maturity';

export interface PricingConfig {
  ticker:       string;
  optionStyle:  OptionStyle;
  optionType:   OptionType;
  strike:       number;
  maturity:     number;
  riskFreeRate: number;
  simulations:  number;
  steps:        number;
  volMode:      'auto' | 'manual';
  volWindow:    VolWindow;
  sigmaOverride: number | null;
  antithetic:   boolean;
}

const DEFAULT_CONFIG: PricingConfig = {
  ticker:        '',
  optionStyle:   'european',
  optionType:    'call',
  strike:        0,
  maturity:      0.5,
  riskFreeRate:  0.05,
  simulations:   100_000,
  steps:         252,
  volMode:       'auto',
  volWindow:     'match_maturity',
  sigmaOverride: null,
  antithetic:    true,
};

/* ── Validation ─────────────────────────────────────────────── */
function validate(cfg: PricingConfig, t: ReturnType<typeof useLanguage>['t']): string | null {
  if (!cfg.ticker)                              return t.errors.requiredField;
  if (cfg.strike <= 0)                          return t.errors.invalidStrike;
  if (cfg.maturity < 0.01 || cfg.maturity > 10) return t.errors.invalidMaturity;
  if (cfg.riskFreeRate < 0 || cfg.riskFreeRate > 1) return t.errors.invalidRate;
  if (cfg.simulations < 1_000 || cfg.simulations > 1_000_000) return t.errors.invalidSims;
  return null;
}

/* ── Props ──────────────────────────────────────────────────── */
interface ConfigPanelProps {
  onRun?:   (config: PricingConfig) => void;
  isRunning?: boolean;
}

/* ── Component ──────────────────────────────────────────────── */
export default function ConfigPanel({ onRun, isRunning = false }: ConfigPanelProps) {
  const { t } = useLanguage();
  const [config, setConfig]   = useState<PricingConfig>(DEFAULT_CONFIG);
  const [error, setError]     = useState<string | null>(null);

  function update<K extends keyof PricingConfig>(key: K, value: PricingConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: value }));
    setError(null);
  }

  function handleSubmit() {
    const err = validate(config, t);
    if (err) { setError(err); return; }
    onRun?.(config);
  }

  function handleReset() {
    setConfig(DEFAULT_CONFIG);
    setError(null);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t.config.title}</h2>
      </div>

      <div className={styles.body}>
        <StockSelector
          value={config.ticker}
          onChange={ticker => update('ticker', ticker)}
          onS0Change={s0 => update('strike', s0)}
        />

        <div className={styles.divider} />

        <OptionForm
          config={config}
          onChange={update}
        />
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      )}

      <div className={styles.footer}>
        <button
          className={styles.resetBtn}
          onClick={handleReset}
          disabled={isRunning}
        >
          {t.config.resetButton}
        </button>
        <button
          className={styles.runBtn}
          onClick={handleSubmit}
          disabled={isRunning || !config.ticker}
        >
          {isRunning ? t.config.runningButton : t.config.runButton}
        </button>
      </div>
    </div>
  );
}