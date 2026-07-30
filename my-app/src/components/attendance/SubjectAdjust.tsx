import { useState, useEffect } from 'react';
import { deriveStats } from '../../lib/attendance';
import { t, resolveLocale, STORAGE_KEY, fmt, type Locale } from '../../lib/i18n';

interface Props {
  subjectId: string;
  /** Counts from logs + backfill, before any manual correction. */
  baseHeld: number;
  baseAttended: number;
  baseExtra: number;
  adjHeld: number;
  adjAttended: number;
  target: number;
  isLab: boolean;
}

export default function SubjectAdjust({
  subjectId, baseHeld, baseAttended, baseExtra, adjHeld: initHeld, adjAttended: initAttended, target, isLab,
}: Props) {
  const [locale, setLocale] = useState<Locale>('en');
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLocale(resolveLocale(saved));
    } catch { }
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.locale) setLocale(detail.locale);
    };
    window.addEventListener('at75:locale-changed', onChange);
    return () => window.removeEventListener('at75:locale-changed', onChange);
  }, []);
  const tr = (key: string, params?: Record<string, string | number>) =>
    params ? fmt(locale, key, params) : t(locale, key);

  const [adjHeld, setAdjHeld] = useState(initHeld);
  const [adjAttended, setAdjAttended] = useState(initAttended);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const held = Math.max(0, baseHeld + adjHeld);
  const attended = Math.max(0, baseAttended + adjAttended);
  const stats = deriveStats(held, attended, baseExtra, target);
  const dirty = adjHeld !== initHeld || adjAttended !== initAttended;

  async function save(nextHeld: number, nextAttended: number) {
    const prev = { adjHeld, adjAttended };
    setAdjHeld(nextHeld);
    setAdjAttended(nextAttended);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/subjects/${subjectId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ adjHeld: nextHeld, adjAttended: nextAttended }),
      });
      if (!res.ok) throw new Error('save failed');
    } catch {
      setAdjHeld(prev.adjHeld);
      setAdjAttended(prev.adjAttended);
      setError(tr('adjust.saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  const tone =
    stats.safe === 'safe' ? 'var(--color-safe)'
      : stats.safe === 'warn' ? 'var(--color-warn)'
        : stats.safe === 'danger' ? 'var(--color-danger)' : 'var(--color-text)';

  return (
    <div className="card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold">{tr('adjust.title')}</h3>
        <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
          {tr(isLab ? 'adjust.propagatesLab' : 'adjust.propagatesSubject')}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Row
          label={tr('adjust.attendedLabel')}
          hint={tr('adjust.attendedHint')}
          delta={adjAttended}
          effective={attended}
          disabled={saving}
          onChange={(d) => save(adjHeld, adjAttended + d)}
          tone="var(--color-safe)"
          tr={tr}
        />
        <Row
          label={tr('adjust.heldLabel')}
          hint={tr('adjust.heldHint')}
          delta={adjHeld}
          effective={held}
          disabled={saving}
          onChange={(d) => save(adjHeld + d, adjAttended)}
          tone="var(--color-brand-600)"
          tr={tr}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>
          {tr('adjust.preview', { attended, held })}
        </span>
        <span className="num text-lg font-semibold" style={{ color: tone }}>
          {stats.pct.toFixed(1)}%
        </span>
      </div>

      {dirty && (
        <button
          type="button"
          className="btn btn-ghost btn-sm mt-2"
          disabled={saving}
          onClick={() => save(0, 0)}
        >
          {tr('adjust.reset')}
        </button>
      )}
      {error && (
        <p className="mt-2 text-sm" style={{ color: 'var(--color-danger)' }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Row({
  label, hint, delta, effective, onChange, disabled, tone, tr,
}: {
  label: string;
  hint: string;
  delta: number;
  effective: number;
  onChange: (d: 1 | -1) => void;
  disabled: boolean;
  tone: string;
  tr: (k: string, p?: Record<string, string | number>) => string;
}) {
  return (
    <div
      className="rounded-lg border"
      style={{ borderColor: delta !== 0 ? tone : 'var(--color-border)', padding: '0.5rem 0.625rem' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0">
          <span className="block text-sm font-medium truncate">{label}</span>
          <span className="block text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>{hint}</span>
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          <Btn label={tr('adjust.ariaDecrease', { label })} onClick={() => onChange(-1)} disabled={disabled}>−</Btn>
          <span className="text-center" style={{ minWidth: 52 }}>
            <span className="num block" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1, color: delta !== 0 ? tone : 'var(--color-text)' }}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
            <span className="num block text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>
              = {effective}
            </span>
          </span>
          <Btn label={tr('adjust.ariaIncrease', { label })} onClick={() => onChange(1)} disabled={disabled}>+</Btn>
        </span>
      </div>
    </div>
  );
}

function Btn({
  children, label, onClick, disabled,
}: {
  children: string;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="num"
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontSize: 18,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
