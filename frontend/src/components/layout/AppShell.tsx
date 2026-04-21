/* ============================================================
   components/layout/AppShell.tsx
   Top-level layout skeleton.

   AppShell
       ├── ConfigPanel  ← receives: onRun, isRunning
       └── PricerMain   ← receives: status, points, result, totalPaths
   ============================================================ */

import TopBar        from './TopBar';
import Footer        from './Footer';
import ConfigPanel   from '../config/ConfigPanel';
import PricerMain    from '../pricer/PricerMain';
import { useConvergence } from '../../hooks/useConvergence';
import type { PricingConfig } from '../config/ConfigPanel';
import styles from './AppShell.module.css';

export default function AppShell() {
  const convergence = useConvergence();

  function handleRun(config: PricingConfig): void {
    convergence.run(config);
  }

  const isRunning =
    convergence.status === 'connecting' ||
    convergence.status === 'running';
  
  return (
    <div className={styles.shell}>
      <TopBar />

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <ConfigPanel 
           onRun={handleRun}
           isRunning={isRunning}
          />
        </aside>

        <main className={styles.main}>
          <PricerMain 
            status={convergence.status}
            points={convergence.points}
            results={convergence.result}
            totalPaths={convergence.totalPaths}
          />
        </main>
      </div>

      <Footer />
    </div>
  );
}