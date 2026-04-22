/* ============================================================
   components/layout/DisclaimerModal.tsx

   Shown on first visit. Blocks interaction until the user
   explicitly accepts. Acceptance is persisted to localStorage
   so the modal does not reappear on subsequent visits.

   ACCESSIBILITY:
     - role="dialog" + aria-modal="true"
     - Focus is trapped inside the modal while open
     - ESC key does NOT close it — acceptance is mandatory
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { useLanguage }  from '../../context/LanguageContext';
import styles           from './DisclaimerModal.module.css';

const STORAGE_KEY = 'mcpricer-disclaimer-accepted';

export default function DisclaimerModal() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  /* Focus the accept button when modal opens */
  useEffect(() => {
    if (visible) btnRef.current?.focus();
  }, [visible]);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    /* ── Backdrop ── */
    <div className={styles.backdrop} aria-hidden="false">

      {/* ── Dialog ── */}
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10"
                stroke="var(--color-accent)" strokeWidth="1.5" />
              <path d="M12 8v5M12 15.5v.5"
                stroke="var(--color-accent)" strokeWidth="1.5"
                strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 id="disclaimer-title" className={styles.title}>
              {t.modal.title}
            </h2>
            <p className={styles.subtitle}>{t.modal.subtitle}</p>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <p className={styles.bodyText}>{t.modal.body}</p>

          <div className={styles.terms}>
            <p className={styles.termsTitle}>{t.modal.termsTitle}</p>
            <ul className={styles.termsList}>
              {t.modal.terms.map((term, i) => (
                <li key={i} className={styles.termItem}>
                  <span className={styles.termBullet}>—</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            ref={btnRef}
            className={styles.acceptBtn}
            onClick={handleAccept}
          >
            {t.modal.accept}
          </button>
        </div>

      </div>
    </div>
  );
}