/* ============================================================
   components/layout/AppShell.tsx
   Top-level layout skeleton.

    DATA FLOW:
     ConfigPanel fires onConfigChange on every field edit.
     AppShell stores the latest config in liveConfig state.
     PricerMain receives the pieces it needs:
       • convergence data  → from useConvergence
       • ticker            → from liveConfig (for PriceHistory)
       • windowDays        → resolved from liveConfig.volWindow
       • strike            → from liveConfig (for K reference line)
   ============================================================ */

import { useState }  from 'react';
import TopBar        from './TopBar';
import Footer        from './Footer';
import ConfigPanel   from '../config/ConfigPanel';
import PricerMain    from '../pricer/PricerMain';
import { useConvergence } from '../../hooks/useConvergence';
import type { PricingConfig } from '../config/ConfigPanel';
import styles from './AppShell.module.css';

/* ── Window label → trading days ───────────────────────────── */
const WINDOW_DAYS: Record<string, number> = {
  '1M':             21,
  '3M':             63,
  '6M':             126,
  '1Y':             252,
  '3Y':             756,
  'match_maturity':   0,  /* resolved below using maturity */
};

function resolveWindowDays(config: PricingConfig): number {
  if (config.volWindow === 'match_maturity') {
    return Math.max(21, Math.round(config.maturity * 252));
  }
  return WINDOW_DAYS[config.volWindow] ?? 252;
}

/* ── Default config — mirrors ConfigPanel DEFAULT_CONFIG ────── */
const DEFAULT_CONFIG: PricingConfig = {
  ticker:         '',
  companyName:    '',
  optionStyle:    'european',
  optionType:     'call',
  strike:         0,
  maturity:       0.5,
  riskFreeRate:   0.05,
  simulations:    100_000,
  steps:          252,
  volMode:        'auto',
  volWindow:      'match_maturity',
  sigmaOverride:  null,
  antithetic:     true,
  parallel:       false,
};

/* ── Component ──────────────────────────────────────────────── */
export default function AppShell() {
  const convergence = useConvergence();

  /* Latest config — updated on every form field change */
  const [liveConfig, setLiveConfig] = useState<PricingConfig>(DEFAULT_CONFIG);

  const isRunning = 
  convergence.status === 'connecting' ||
  convergence.status === 'running';

  function handleRun(config: PricingConfig): void {
    convergence.run(config);
  }

  function handleConfigChange(config: PricingConfig): void {
    setLiveConfig(config)
  }

  function handleReset(): void {
    convergence.stop();
  }
  
  return (
    <div className={styles.shell}>
      <TopBar />

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <ConfigPanel 
           onRun={handleRun}
           onConfigChange={handleConfigChange}
           onReset={handleReset}
           isRunning={isRunning}
          />
        </aside>

        <main className={styles.main}>
          <PricerMain 
            status={convergence.status}
            points={convergence.points}
            result={convergence.result}
            totalPaths={convergence.totalPaths}
            ticker={liveConfig.ticker}
            companyName={liveConfig.companyName}
            strike={liveConfig.strike}
            windowDays={resolveWindowDays(liveConfig)}
          />
        </main>
      </div>

      <Footer />
    </div>
  );
}