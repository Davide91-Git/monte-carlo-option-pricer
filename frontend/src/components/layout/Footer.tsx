/* ============================================================
   components/layout/Footer.tsx
   Three-column link grid + bottom bar with copyright and stack.
   All strings come from the message dictionary.
   ============================================================ */

import { useLanguage } from '../../context/LanguageContext';
import styles from './Footer.module.css';

/* ── Types ──────────────────────────────────────────────────── */
interface FooterLink {
  label: string;
  href:  string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

/* ── Stack chips ────────────────────────────────────────────── */
const STACK = ['FastAPI', 'React', 'PostgreSQL', 'Docker', 'WebSocket'] as const;

/* ── Sub-components ─────────────────────────────────────────── */
function FooterCol({ title, links }: FooterColumn) {
  return (
    <div className={styles.col}>
      <span className={styles.colTitle}>{title}</span>
      <ul className={styles.colLinks}>
        {links.map(link => (
          <li key={link.href}>
            <a
              href={link.href}
              className={styles.link}
              {...(link.external
                ? { target: '_blank', rel: 'noreferrer noopener' }
                : {})}
            >
              {link.label}
              {link.external && (
                <svg
                  className={styles.externalIcon}
                  width="10" height="10" viewBox="0 0 10 10"
                  fill="none" stroke="currentColor"
                  strokeWidth="1.5" strokeLinecap="round"
                >
                  <path d="M2 8L8 2M4 2h4v4" />
                </svg>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const columns: FooterColumn[] = [
    {
      title: t.footer.project,
      links: [
        { label: t.footer.github,        href: 'https://github.com/Davide91-Git/monte-carlo-option-pricer', external: true },
        { label: t.footer.documentation, href: '#docs' },
        { label: t.footer.methodology,   href: '#methodology' },
      ],
    },
    {
      title: t.footer.engine,
      links: [
        { label: t.footer.european,     href: '#european' },
        { label: t.footer.asian,        href: '#asian' },
        { label: t.footer.blackScholes, href: '#black-scholes' },
      ],
    },
    {
      title: t.footer.author,
      links: [
        { label: 'Davide91-Git', href: 'https://github.com/Davide91-Git', external: true },
        { label: t.footer.linkedin, href: 'https://linkedin.com', external: true },
      ],
    },
  ];

  return (
    <footer className={styles.footer} role="contentinfo">
      {/* ── Top: brand + columns ── */}
      <div className={styles.top}>
        <div className={styles.brand}>
          <div className={styles.brandName}>
            MC<span className={styles.brandAccent}>Pricer</span>
          </div>
          <p className={styles.brandTagline}>{t.app.tagline}</p>
        </div>

        <div className={styles.columns}>
          {columns.map(col => (
            <FooterCol key={col.title} {...col} />
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className={styles.divider} />

      {/* ── Bottom: copyright + stack ── */}
      <div className={styles.bottom}>
        <div className={styles.legal}>
          <span className={styles.copyright}>
            {t.footer.copyright.replace('{year}', String(year))}
          </span>
          <span className={styles.legalDot}>·</span>
          <span className={styles.disclaimer}>{t.footer.disclaimer}</span>
        </div>

        <div className={styles.stack}>
          {STACK.map(chip => (
            <span key={chip} className={styles.chip}>{chip}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}