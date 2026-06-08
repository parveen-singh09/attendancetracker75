import { useState } from 'react';
import { type Stats, whatIf } from '../../lib/attendance';

interface Props {
  base: Stats;
  target: number;
}

export default function WhatIfSimulator({ base, target }: Props) {
  const [n, setN] = useState(1);

  const attended = whatIf(base, n, 'attend');
  const missed = whatIf(base, n, 'miss');

  return (
    <div className="card">
      <h3 className="text-base font-semibold">What if…</h3>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-subtle)' }}>
        Simulate the next <span className="num">{n}</span> class{n === 1 ? '' : 'es'} of this subject.
      </p>

      <div className="mt-3 flex items-center gap-3">
        <label className="text-sm" htmlFor="whatif-n">Number of classes</label>
        <input
          id="whatif-n"
          type="range"
          min={1}
          max={20}
          value={n}
          onChange={(e) => setN(parseInt(e.target.value, 10))}
          className="flex-1"
          aria-label="Number of classes to simulate"
        />
        <span className="num w-8 text-right text-sm font-medium">{n}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Tile label="Now" pct={base.pct} tone={base.safe} />
        <Tile label={`If you attend next ${n}`} pct={attended.pct} tone={toneFor(attended, target)} delta={attended.pct - base.pct} />
        <Tile label={`If you miss next ${n}`} pct={missed.pct} tone={toneFor(missed, target)} delta={missed.pct - base.pct} />
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

function Tile({ label, pct, tone, delta }: { label: string; pct: number; tone: 'safe' | 'warn' | 'danger' | 'none'; delta?: number }) {
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
          {delta > 0 ? '+' : ''}{delta.toFixed(1)} pts
        </div>
      )}
    </div>
  );
}
