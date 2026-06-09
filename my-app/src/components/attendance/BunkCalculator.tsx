import { useState } from 'react';
import { computeStats, type AttendanceLog, type DayOverride } from '../../lib/attendance';

interface Props {
  target: number;
  logs: AttendanceLog[];
  days: DayOverride[];
}

export default function BunkCalculator({ target, logs, days }: Props) {
  const [attended, setAttended] = useState<number | ''>('');
  const [held, setHeld] = useState<number | ''>('');

  const numHeld = held === '' ? 0 : held;
  const numAttended = attended === '' ? 0 : attended;

  const stats = computeStats(
    numHeld === 0 && numAttended === 0
      ? logs
      : Array.from({ length: numHeld }, (_, i) => ({
          date: `sim-${i}`,
          status: i < numAttended ? 'present' : 'absent' as 'present' | 'absent',
        })),
    days,
    target
  );

  const pct = stats.pct.toFixed(1);

  return (
    <div className="card">
      <h3 className="text-base font-semibold">Quick calculator</h3>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-subtle)' }}>
        Punch in two numbers. No account needed.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="field">
          <label className="field-label" htmlFor="attended">Classes attended</label>
          <input
            id="attended"
            type="number"
            min={0}
            value={attended}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setAttended('');
              } else {
                const parsed = parseInt(val, 10);
                if (!isNaN(parsed)) {
                  setAttended(Math.max(0, parsed));
                }
              }
            }}
            className="input num"
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 42"
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="held">Classes held</label>
          <input
            id="held"
            type="number"
            min={0}
            value={held}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setHeld('');
              } else {
                const parsed = parseInt(val, 10);
                if (!isNaN(parsed)) {
                  setHeld(Math.max(0, parsed));
                }
              }
            }}
            className="input num"
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 50"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Current" value={`${pct}%`} tone={stats.safe} />
        <Stat label="Can miss" value={stats.canMiss} hint={`stay ≥ ${target}%`} />
        <Stat label="Need to attend" value={stats.mustAttend} hint="to reach target" />
      </div>

      {numHeld > 0 && numAttended > numHeld && (
        <p className="mt-2 text-xs" style={{ color: 'var(--color-danger)' }}>
          Attended can&apos;t be greater than held.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: 'safe' | 'warn' | 'danger' | 'none' }) {
  const color =
    tone === 'safe' ? 'var(--color-safe)' :
    tone === 'warn' ? 'var(--color-warn)' :
    tone === 'danger' ? 'var(--color-danger)' :
    'var(--color-text)';
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--color-border)' }}>
      <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-subtle)' }}>{label}</div>
      <div className="num mt-1 text-2xl font-semibold" style={{ color }}>{value}</div>
      {hint && <div className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>{hint}</div>}
    </div>
  );
}
