/* ============================================================
   components/pricer/SimulationProgress.tsx
   Progress bar shown while the WebSocket streams batches.
   Updates smoothly with each batch received.
   ============================================================ */

import { useLanguage } from '../../context/LanguageContext';
import type { SimStatus } from '../../hooks/useConvergence';
import styles from './SimulationProgress.module.css';

interface Props {
  status:  SimStatus;
  current: number;   /* paths simulated so far */
  total:   number;   /* total paths requested  */
}

export default function SimulationProgress({ status, current, total }: Props) {
  const { t } = useLanguage();

  const pct     = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const isDone  = status === 'done';

  const statusText = isDone
    ? t.progress.done
    : status === 'connecting'
      ? t.progress.connecting
      : t.progress.running
          .replace('{n}',     current.toLocaleString())
          .replace('{total}', total.toLocaleString());

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={`${styles.status} ${isDone ? styles.statusDone : ''}`}>
          {statusText}
        </span>
        <span className={styles.pct}>
          {pct.toFixed(0)}%
        </span>
      </div>

      <div className={styles.track}>
        <div
          className={`${styles.fill} ${isDone ? styles.fillDone : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className={styles.meta}>
        <span className={styles.metaVal}>
          {current.toLocaleString()}
        </span>
        <span className={styles.metaSep}>/</span>
        <span className={styles.metaMuted}>
          {total.toLocaleString()} {t.results.paths.toLowerCase()}
        </span>
      </div>
    </div>
  );
}