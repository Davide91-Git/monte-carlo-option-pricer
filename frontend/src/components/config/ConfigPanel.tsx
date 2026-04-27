/* ============================================================
   components/config/ConfigPanel.tsx
   Sidebar container. Owns the form state and passes it down
   to StockSelector and OptionForm.

   CALLBACKS:
     onRun(config)          — fired when user clicks Run
     onConfigChange(config) — fired on every field change
                              so AppShell always has the
                              latest ticker/strike/window
                              to pass to PriceHistory
   ============================================================ */

import { useState, useEffect }    from 'react';
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
  companyName:  string;
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
  parallel:     boolean;
}

const DEFAULT_CONFIG: PricingConfig = {
  ticker:        '',
  companyName:   '',
  optionStyle:   'european',
  optionType:    'call',
  strike:        0,
  maturity:      0.25,
  riskFreeRate:  0.05,
  simulations:   100_000,
  steps:         252,
  volMode:       'auto',
  volWindow:     'match_maturity',
  sigmaOverride: null,
  antithetic:    true,
  parallel:      false,
};

/* ── Validation ─────────────────────────────────────────────── */
function validate(
  cfg: PricingConfig, 
  t: ReturnType<typeof useLanguage>['t'],
): string | null {
  if (!cfg.ticker) return t.errors.requiredField;
  if (cfg.strike <= 0) return t.errors.invalidStrike;
  if (cfg.maturity < 0.01 || cfg.maturity > 10) return t.errors.invalidMaturity;
  if (cfg.riskFreeRate < 0 || cfg.riskFreeRate > 1) return t.errors.invalidRate;
  if (cfg.simulations < 1_000 || cfg.simulations > 1_000_000) return t.errors.invalidSims;
  return null;
}

/* ── Props ──────────────────────────────────────────────────── */
interface ConfigPanelProps {
  onRun?: (config: PricingConfig) => void;
  onConfigChange?: (config: PricingConfig) => void;
  onReset?: () => void;
  isRunning?: boolean;
}

/* ── Component ──────────────────────────────────────────────── */
export default function ConfigPanel({ 
  onRun,
  onConfigChange,
  onReset,
  isRunning = false 
}: ConfigPanelProps) {
  const { t } = useLanguage();
  const [config, setConfig]   = useState<PricingConfig>(DEFAULT_CONFIG);
  const [error, setError]     = useState<string | null>(null);

  /* Notify parent on every config change */
  useEffect(() => {
    onConfigChange?.(config);
  }, [config]);

  /* Central update — notifies parent on every change */
  function update<K extends keyof PricingConfig>(
    key: K, 
    value: PricingConfig[K],
  ): void {
    setConfig((prev: PricingConfig) => { 
      const next = {...prev, [key]: value };
      return next;
    });
    setError(null);
  }
  
  function handleSubmit(): void {
    const err = validate(config, t);
    if (err) { setError(err); return; }
    onRun?.(config);
  }

  function handleReset(): void {
    setConfig(DEFAULT_CONFIG);
    onConfigChange?.(DEFAULT_CONFIG);
    onReset?.();
    setError(null);
  }

  function handleTickerChange(ticker: string): void {
    update('ticker', ticker);
    update('companyName', '');
  }

  function handleCompanyNameChange(name: string): void {
  update('companyName', name);
  }

  function handleS0Change(s0: number): void {
    update('strike', s0)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t.config.title}</h2>
      </div>

      <div className={styles.body}>
        <StockSelector
          value={config.ticker}
          onChange={handleTickerChange}
          onS0Change={handleS0Change}
          onCompanyNameChange={handleCompanyNameChange}
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
          disabled={isRunning || !config.ticker || config.strike < 0}
          style={{whiteSpace: 'nowrap'}}
        >
          {isRunning ? t.config.runningButton : t.config.runButton}
        </button>
      </div>
    </div>
  );
}