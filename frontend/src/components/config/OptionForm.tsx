/* ============================================================
   components/config/OptionForm.tsx
   Renders all pricing parameters below the stock selector.
   Receives config + onChange from ConfigPanel.
   ============================================================ */

import { useLanguage } from '../../context/LanguageContext';
import type { PricingConfig, OptionStyle, OptionType, VolWindow } from './ConfigPanel';
import styles from './OptionForm.module.css';

/* ── Reusable field wrapper ─────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}

/* ── Segmented control ──────────────────────────────────────── */
function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value:   T;
  onChange: (v: T) => void;
}) {
  return (
    <div className={styles.segmented}>
      {options.map(opt => (
        <button
          key={opt.value}
          className={`${styles.segBtn} ${value === opt.value ? styles.segBtnActive : ''}`}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Number input ───────────────────────────────────────────── */
function NumberInput({
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 'any',
}: {
  value:       number | '';
  onChange:    (v: number) => void;
  placeholder?: string;
  min?:        number;
  max?:        number;
  step?:       number | 'any';
}) {
  return (
    <input
      className={styles.input}
      type="number"
      value={value}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      onChange={e => {
        const n = parseFloat(e.target.value);
        if (!isNaN(n)) onChange(n);
      }}
    />
  );
}

/* ── Toggle ─────────────────────────────────────────────────── */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked:  boolean;
  onChange: (v: boolean) => void;
  label:    string;
}) {
  return (
    <button
      type="button"
      className={styles.toggleRow}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className={styles.toggleLabel}>{label}</span>
      <span className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}>
        <span className={styles.toggleThumb} />
      </span>
    </button>
  );
}

/* ── Main component ─────────────────────────────────────────── */
interface Props {
  config:   PricingConfig;
  onChange: <K extends keyof PricingConfig>(key: K, value: PricingConfig[K]) => void;
}

export default function OptionForm({ config, onChange }: Props) {
  const { t } = useLanguage();

  const styleOptions: { value: OptionStyle; label: string }[] = [
    { value: 'european', label: t.config.european },
    { value: 'asian',    label: t.config.asian },
  ];

  const typeOptions: { value: OptionType; label: string }[] = [
    { value: 'call', label: t.config.call },
    { value: 'put',  label: t.config.put },
  ];

  const volWindowOptions: { value: VolWindow; label: string }[] = [
    { value: 'match_maturity', label: t.config.volWindowMatch },
    { value: '1M',             label: t.config.volWindow1M },
    { value: '3M',             label: t.config.volWindow3M },
    { value: '6M',             label: t.config.volWindow6M },
    { value: '1Y',             label: t.config.volWindow1Y },
    { value: '3Y',             label: t.config.volWindow3Y },
  ];

  return (
    <div className={styles.form}>

      {/* ── Style & Type ── */}
      <Field label={t.config.optionStyle}>
        <Segmented
          options={styleOptions}
          value={config.optionStyle}
          onChange={v => onChange('optionStyle', v)}
        />
      </Field>

      <Field label={t.config.optionType}>
        <Segmented
          options={typeOptions}
          value={config.optionType}
          onChange={v => onChange('optionType', v)}
        />
      </Field>

      <div className={styles.sectionDivider} />

      {/* ── Pricing parameters ── */}
      <Field label={t.config.strike}>
        <NumberInput
          value={config.strike || ''}
          onChange={v => onChange('strike', v)}
          placeholder={t.config.strikePlaceholder}
          min={0}
          step={0.5}
        />
      </Field>

      <Field label={t.config.maturity}>
        <NumberInput
          value={config.maturity}
          onChange={v => onChange('maturity', v)}
          placeholder={t.config.maturityPlaceholder}
          min={0.01}
          max={10}
          step={0.25}
        />
      </Field>

      <Field label={t.config.riskFreeRate}>
        <NumberInput
          value={config.riskFreeRate}
          onChange={v => onChange('riskFreeRate', v)}
          placeholder={t.config.riskFreePlaceholder}
          min={0}
          max={1}
          step={0.005}
        />
      </Field>

      <Field label={t.config.simulations}>
        <NumberInput
          value={config.simulations}
          onChange={v => onChange('simulations', Math.round(v))}
          min={1_000}
          max={1_000_000}
          step={10_000}
        />
      </Field>

      <div className={styles.sectionDivider} />

      {/* ── Volatility ── */}
      <Field label={t.config.volatility}>
        <Segmented
          options={[
            { value: 'auto',   label: t.config.volAuto },
            { value: 'manual', label: t.config.volManual },
          ]}
          value={config.volMode}
          onChange={v => onChange('volMode', v as 'auto' | 'manual')}
        />
      </Field>

      {config.volMode === 'auto' && (
        <Field label={t.config.volWindow}>
          <select
            className={styles.select}
            value={config.volWindow}
            onChange={e => onChange('volWindow', e.target.value as VolWindow)}
          >
            {volWindowOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      {config.volMode === 'manual' && (
        <Field label="σ (override)">
          <NumberInput
            value={config.sigmaOverride ?? ''}
            onChange={v => onChange('sigmaOverride', v)}
            placeholder="e.g. 0.23"
            min={0.001}
            max={5}
            step={0.01}
          />
        </Field>
      )}

      <div className={styles.sectionDivider} />

      {/* ── Variance reduction ── */}
      <Toggle
        label={t.config.antithetic}
        checked={config.antithetic}
        onChange={v => onChange('antithetic', v)}
      />

    </div>
  );
}