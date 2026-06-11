import { useState, useEffect } from 'react';
import { type Stats, whatIf } from '../../lib/attendance';
import { t, resolveLocale, STORAGE_KEY, fmt, type Locale } from '../../lib/i18n';

interface Props {
  base: Stats;
  target: number;
}

export default function WhatIfSimulator({ base, target }: Props) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLocale(resolveLocale(saved));
      }
    } catch {}

    const handleLocaleChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.locale) {
        setLocale(detail.locale);
      }
    };
    window.addEventListener('at75:locale-changed', handleLocaleChange);
    return () => window.removeEventListener('at75:locale-changed', handleLocaleChange);
  }, []);

  const tr = (key: string, params?: Record<string, string | number>) => {
    if (params) {
      return fmt(locale, key, params);
    }
    return t(locale, key);
  };

  const [n, setN] = useState(1);

  const attended = whatIf(base, n, 'attend');
  const missed = whatIf(base, n, 'miss');

  return (
    <div className="card">
      <h3 className="text-base font-semibold">{tr('whatif.title')}</h3>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-subtle)' }}>
        {n === 1 ? tr('whatif.body.singular', { n }) : tr('whatif.body.plural', { n })}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <label className="text-sm" htmlFor="whatif-n">{tr('whatif.labelNumClasses')}</label>
        <input
          id="whatif-n"
          type="range"
          min={1}
          max={20}
          value={n}
          onChange={(e) => setN(parseInt(e.target.value, 10))}
          className="flex-1"
          aria-label={tr('whatif.ariaLabelRange')}
        />
        <span className="num w-8 text-right text-sm font-medium">{n}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Tile label={tr('whatif.tile.now')} pct={base.pct} tone={base.safe} tr={tr} />
        <Tile label={tr('whatif.tile.ifAttend', { n })} pct={attended.pct} tone={toneFor(attended, target)} delta={attended.pct - base.pct} tr={tr} />
        <Tile label={tr('whatif.tile.ifMiss', { n })} pct={missed.pct} tone={toneFor(missed, target)} delta={missed.pct - base.pct} tr={tr} />
      </div>
    </div>
  );
}

function toneFor(s: Stats, target: number): 'safe' | 'warn' | 'danger' | 'none' {
  if (s.held === 0) return 'none';
  if (s.pct >= target) return 'safe';
  if (s.pct >= target - 5) return 'warn';
  return 'danger';
}

function Tile({ label, pct, tone, delta, tr }: { label: string; pct: number; tone: 'safe' | 'warn' | 'danger' | 'none'; delta?: number; tr: any }) {
  const color =
    tone === 'safe' ? 'var(--color-safe)' :
    tone === 'warn' ? 'var(--color-warn)' :
    tone === 'danger' ? 'var(--color-danger)' :
    'var(--color-text)';
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--color-border)' }}>
      <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-subtle)' }}>{label}</div>
      <div className="num mt-1 text-2xl font-semibold" style={{ color }}>{pct.toFixed(1)}%</div>
      {delta !== undefined && (
        <div className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
          {tr('whatif.pts', { delta: (delta > 0 ? '+' : '') + delta.toFixed(1) })}
        </div>
      )}
    </div>
  );
}
