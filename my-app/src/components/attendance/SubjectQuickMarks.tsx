import { useState, useEffect } from 'react';
import { t, resolveLocale, STORAGE_KEY, fmt, type Locale } from '../../lib/i18n';

type DbStatus = 'present' | 'absent' | 'extra' | 'off';

type CounterKind = 'regular' | 'absent' | 'extra' | 'off';

interface Subject {
  id: string;
  name: string;
  color: string;
  code?: string | null;
  location?: string | null;
  isLab: boolean;
  regular: number;
  absent: number;
  extra: number;
  off: boolean;
  hasRegularSlot: boolean;
  pct: number;
  held: number;
  attended: number;
}

interface Props {
  date: string;
  subjects: Subject[];
  targetPct: number;
  calcMode: 'subject' | 'lab' | 'both';
  initialOverall: { held: number; attended: number; extra: number };
}

function kindToDbStatus(k: CounterKind): DbStatus {
  return k === 'regular' ? 'present' : (k as DbStatus);
}

function todayHeldContrib(s: Pick<Subject, 'regular' | 'absent' | 'extra' | 'off' | 'hasRegularSlot'>): number {
  if (s.off) return 0;
  const explicitHeld = s.regular + s.absent;
  const isDefaultAbsent = s.regular + s.absent + s.extra === 0 && s.hasRegularSlot;
  return isDefaultAbsent ? explicitHeld + 1 : explicitHeld;
}

function todayAttendedContrib(s: Pick<Subject, 'regular' | 'extra' | 'off'>): number {
  if (s.off) return 0;
  return s.regular + s.extra;
}

export default function SubjectQuickMarks({ date, subjects: initial, targetPct, calcMode, initialOverall }: Props) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLocale(resolveLocale(saved));
      }
    } catch { }

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

  const [subjects, setSubjects] = useState<Subject[]>(initial);
  const [toast, setToast] = useState<{ message: string; undo?: () => void } | null>(null);

  useEffect(() => {
    let deltaHeld = 0;
    let deltaAttended = 0;
    let deltaExtra = 0;

    subjects.forEach((s) => {
      const init = initial.find((x) => x.id === s.id);
      if (init) {
        const shouldInclude =
          calcMode === 'both' ||
          (calcMode === 'lab' && s.isLab) ||
          (calcMode === 'subject' && !s.isLab);

        if (shouldInclude) {
          deltaHeld += todayHeldContrib(s) - todayHeldContrib(init);
          deltaAttended += todayAttendedContrib(s) - todayAttendedContrib(init);
          deltaExtra += (s.extra - init.extra);
        }
      }
    });

    const newHeld = initialOverall.held + deltaHeld;
    const newAttended = initialOverall.attended + deltaAttended;
    const newPct = newHeld === 0 ? 0 : Math.min(100, (newAttended / newHeld) * 100);

    const pctStr = newPct.toFixed(1) + '%';

    const sideEl = document.getElementById('sidebar-session-pct');
    if (sideEl) sideEl.textContent = pctStr;
    const sideCollapsedEl = document.getElementById('sidebar-session-pct-collapsed');
    if (sideCollapsedEl) sideCollapsedEl.textContent = Math.floor(newPct) + '%';

    
    const todayPctEl = document.getElementById('today-overall-pct');
    if (todayPctEl) {
      todayPctEl.textContent = pctStr;
      
      if (newHeld > 0) {
        if (newPct >= targetPct) todayPctEl.style.color = 'var(--color-safe)';
        else if (newPct >= targetPct - 5) todayPctEl.style.color = 'var(--color-warn)';
        else todayPctEl.style.color = 'var(--color-danger)';
      }
    }

    
    const todayFracEl = document.getElementById('today-overall-fraction');
    if (todayFracEl) todayFracEl.textContent = tr('today.attendedOf', { attended: newAttended, held: newHeld });

    
    let todayHeld = 0;
    let todayAttended = 0;
    let todayExtra = 0;
    let todaySubjs = 0;

    subjects.forEach((s) => {
      const shouldInclude =
        calcMode === 'both' ||
        (calcMode === 'lab' && s.isLab) ||
        (calcMode === 'subject' && !s.isLab);

      if (shouldInclude) {
        const isActiveToday = s.hasRegularSlot || s.regular > 0 || s.absent > 0 || s.extra > 0 || s.off;
        if (isActiveToday) {
          todaySubjs += 1;
          const isDefaultAbsent = s.regular + s.absent + s.extra === 0 && s.hasRegularSlot && !s.off;
          todayHeld += (s.regular + s.absent + (isDefaultAbsent ? 1 : 0));
          todayAttended += s.regular;
          todayExtra += s.extra;
        }
      }
    });

    const heldEl = document.getElementById('stat-held');
    if (heldEl) heldEl.textContent = String(todayHeld);
    const attendedEl = document.getElementById('stat-attended');
    if (attendedEl) attendedEl.textContent = String(todayAttended);
    const extraEl = document.getElementById('stat-extra');
    if (extraEl) extraEl.textContent = String(todayExtra);
    const subjsEl = document.getElementById('stat-subjects');
    if (subjsEl) subjsEl.textContent = String(todaySubjs);

    
    const barContainer = document.getElementById('today-overall-bar');
    if (barContainer) {
      const progressBar = barContainer.querySelector('[role="progressbar"]');
      const progressFill = barContainer.querySelector('.absolute.inset-y-0.left-0');
      if (progressBar && progressFill) {
        const clamped = Math.max(0, Math.min(100, newPct));
        progressBar.setAttribute('aria-valuenow', String(Math.round(clamped)));
        progressBar.setAttribute('aria-label', `Attendance ${newPct.toFixed(1)} percent`);
        (progressFill as HTMLElement).style.width = `${clamped}%`;

        
        let barTone = 'var(--color-danger)';
        if (newHeld > 0) {
          if (newPct >= targetPct) barTone = 'var(--color-safe)';
          else if (newPct >= targetPct - 5) barTone = 'var(--color-warn)';
        }
        (progressFill as HTMLElement).style.backgroundColor = barTone;
      }
    }
  }, [subjects, initial, initialOverall, targetPct, locale]);

  function showToast(message: string, undo?: () => void) {
    setToast({ message, undo });
    window.setTimeout(() => setToast(null), 4000);
  }

  function recompute(s: Subject): Subject {
    const explicitHeld = s.regular + s.absent;
    const held = s.off
      ? 0
      : (s.regular + s.absent + s.extra === 0 && s.hasRegularSlot ? explicitHeld + 1 : explicitHeld);
    const attended = s.regular + s.extra;
    const pct = held === 0 ? 0 : (attended / held) * 100;
    return { ...s, pct, held, attended };
  }

  function adjust(s: Subject, kind: CounterKind, delta: 1 | -1): Subject {
    if (kind === 'off') {
      
      if (delta !== 1) return s;
      const nextOff = !s.off;
      if (nextOff) {
        
        return recompute({ ...s, off: nextOff, regular: 0, absent: 0, extra: 0 });
      }
      return recompute({ ...s, off: nextOff });
    }
    if (kind === 'regular') {
      const next = Math.max(0, s.regular + delta);
      if (next === s.regular) return s;
      return recompute({ ...s, regular: next });
    }
    if (kind === 'absent') {
      const next = Math.max(0, s.absent + delta);
      if (next === s.absent) return s;
      return recompute({ ...s, absent: next });
    }
    
    const next = Math.max(0, s.extra + delta);
    if (next === s.extra) return s;
    return recompute({ ...s, extra: next });
  }

  async function callApi(s: Subject, kind: CounterKind, op: 'add' | 'remove' | 'clear') {
    const res = await fetch('/api/attendance', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        subjectId: s.id,
        date,
        status: kindToDbStatus(kind),
        op,
      }),
    });
    if (!res.ok) throw new Error('Save failed');
  }

  async function change(s: Subject, kind: CounterKind, delta: 1 | -1) {
    if (kind === 'off') {
      if (delta !== 1) return; 
      const prev = s;
      const optimistic = adjust(s, kind, 1);
      setSubjects((arr) => arr.map((x) => x.id === s.id ? optimistic : x));
      try {
        if (optimistic.off) {
          
          await callApi(s, kind, 'clear');
          await callApi(s, kind, 'add');
        } else {
          await callApi(s, kind, 'remove');
        }
        showToast(
          optimistic.off
            ? tr('quickMarks.toast.markedOff', { name: s.name })
            : tr('quickMarks.toast.markedNotOff', { name: s.name }),
          () => change(prev, kind, 1)
        );
      } catch (e) {
        setSubjects((arr) => arr.map((x) => x.id === s.id ? prev : x));
        showToast(tr('dailyGrid.toast.saveFailed'));
      }
      return;
    }

    
    
    if (s.off) {
      showToast(tr('quickMarks.toast.isOffClearFirst', { name: s.name }));
      return;
    }

    
    if (delta === -1) {
      if (kind === 'regular' && s.regular === 0) return;
      if (kind === 'absent' && s.absent === 0) return;
      if (kind === 'extra' && s.extra === 0) return;
    }

    const prev = s;
    const optimistic = adjust(s, kind, delta);
    setSubjects((arr) => arr.map((x) => x.id === s.id ? optimistic : x));
    try {
      await callApi(s, kind, delta === 1 ? 'add' : 'remove');
      const action =
        kind === 'regular'
          ? (delta === 1 ? tr('quickMarks.action.addRegular') : tr('quickMarks.action.removeRegular'))
          : kind === 'absent'
            ? (delta === 1 ? tr('quickMarks.action.addAbsent') : tr('quickMarks.action.removeAbsent'))
            : (delta === 1 ? tr('quickMarks.action.addExtra') : tr('quickMarks.action.removeExtra'));
      showToast(tr('quickMarks.toast.action', { name: s.name, action }), () => change(prev, kind, delta === 1 ? -1 : 1));
    } catch (e) {
      setSubjects((arr) => arr.map((x) => x.id === s.id ? prev : x));
      showToast(tr('dailyGrid.toast.saveFailed'));
    }
  }

  if (subjects.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '1.5rem' }}>
        <p style={{ color: 'var(--color-text-subtle)' }}>{tr('quickMarks.noSubjects')}</p>
      </div>
    );
  }

  return (
    <div>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {subjects.map((s) => (
          <li
            key={s.id}
            className="card flex flex-col gap-2 py-3 px-4"
          >
            <span className="flex items-center gap-3 min-w-0">
              <span
                aria-hidden="true"
                style={{
                  width: 4,
                  alignSelf: 'stretch',
                  minHeight: 44,
                  borderRadius: 2,
                  backgroundColor: s.color,
                  flexShrink: 0,
                }}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <a href={`/app/subjects/${s.id}`} className="font-semibold hover:underline truncate">
                    {s.name}
                  </a>
                  {s.location && (
                    <span className="text-sm font-medium truncate shrink-0" style={{ color: 'var(--color-text-subtle)' }}>
                      {s.location}
                    </span>
                  )}
                </span>
                {(s.code || s.isLab) && (
                  <span className="text-xs flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>
                    {s.code && <span className="num">{s.code}</span>}
                    {s.isLab && <span className="rounded px-1 py-0.5 text-[10px] font-medium uppercase" style={{ backgroundColor: 'var(--color-surface-2)' }}>{tr('dailyGrid.labLabel')}</span>}
                  </span>
                )}
              </span>
            </span>

            <span className="grid gap-1.5 grid-cols-2 sm:grid-cols-4">
              <Counter
                label={tr('quickMarks.labelRegular')}
                value={s.regular}
                onAdd={() => change(s, 'regular', 1)}
                onRemove={() => change(s, 'regular', -1)}
                tone="safe"
                disabled={s.off}
                disabledReason={tr('quickMarks.disabledReason')}
                tr={tr}
              />
              <Counter
                label={tr('quickMarks.labelAbsent')}
                value={s.absent || (s.regular === 0 && s.extra === 0 && s.hasRegularSlot && !s.off ? 1 : 0)}
                onAdd={() => change(s, 'absent', 1)}
                onRemove={() => change(s, 'absent', -1)}
                tone="danger"
                disabled={s.off}
                disabledReason={tr('quickMarks.disabledReason')}
                tr={tr}
              />
              <Counter
                label={tr('quickMarks.labelExtra')}
                value={s.extra}
                onAdd={() => change(s, 'extra', 1)}
                onRemove={() => change(s, 'extra', -1)}
                tone="brand"
                disabled={s.off}
                disabledReason={tr('quickMarks.disabledReason')}
                tr={tr}
              />
              <OffToggle
                on={s.off}
                onToggle={() => change(s, 'off', 1)}
                tr={tr}
              />
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1" style={{ color: 'var(--color-text-subtle)' }}>
        <div className="flex gap-1.5">
          <span className="opacity-60">•</span>
          <span>
            <strong style={{ color: 'var(--color-text)' }}>{tr('quickMarks.notes.header')}</strong> {tr('quickMarks.notes.absentIfNoLogs', { absent: tr('quickMarks.labelAbsent') })}
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="opacity-60">•</span>
          <span>{tr('quickMarks.notes.increaseRegularOrExtra')}</span>
        </div>
        <div className="flex gap-1.5"><span className="opacity-60">•</span> <span><strong>{tr('quickMarks.labelRegular')}</strong> {tr('quickMarks.notes.regularCounts')}</span></div>
        <div className="flex gap-1.5"><span className="opacity-60">•</span> <span><strong>{tr('quickMarks.labelExtra')}</strong> {tr('quickMarks.notes.extraBoosts')}</span></div>
        <div className="flex gap-1.5"><span className="opacity-60">•</span> <span><strong>{tr('quickMarks.labelOff')}</strong> {tr('quickMarks.notes.offRemoves')}</span></div>
        <div className="flex gap-1.5"><span className="opacity-60">•</span> <span>{tr('quickMarks.notes.usePlusMinus')}</span></div>
      </div>

      {toast && (
        <div className="toast-root" role="status" aria-live="polite">
          <div className="toast">
            <span>{toast.message}</span>
            {toast.undo && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  toast.undo?.();
                  setToast(null);
                }}
              >
                {tr('dailyGrid.undo')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Counter({
  label, value, onAdd, onRemove, tone, disabled = false, disabledReason, tr
}: {
  label: string;
  value: number;
  onAdd: () => void;
  onRemove: () => void;
  tone: 'safe' | 'danger' | 'brand';
  disabled?: boolean;
  disabledReason?: string;
  tr: any;
}) {
  const activeColor =
    tone === 'safe' ? 'var(--color-safe)' :
      tone === 'danger' ? 'var(--color-danger)' :
        'var(--color-brand-600)';
  const minusDisabled = disabled || value === 0;
  const plusDisabled = disabled;
  return (
    <span
      className="rounded-lg border flex items-center justify-between gap-1"
      style={{ borderColor: value > 0 ? activeColor : 'var(--color-border)', padding: '0.25rem 0.5rem', minHeight: 44, opacity: disabled ? 0.55 : 1 }}
      title={disabled ? disabledReason : undefined}
      aria-disabled={disabled || undefined}
    >
      <button
        type="button"
        onClick={onRemove}
        disabled={minusDisabled}
        aria-label={tr('quickMarks.ariaLabelRemove', { label })}
        className="num"
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          color: minusDisabled ? 'var(--color-text-subtle)' : 'var(--color-text)',
          fontSize: 18,
          fontWeight: 600,
          cursor: minusDisabled ? 'not-allowed' : 'pointer',
          opacity: minusDisabled ? 0.5 : 1,
          flexShrink: 0,
        }}
      >
        −
      </button>
      <span className="text-center flex-1">
        <span
          className="num block"
          style={{
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1,
            color: value > 0 ? activeColor : 'var(--color-text)',
          }}
        >
          {value}
        </span>
        <span
          className="text-[10px] uppercase tracking-wide mt-0.5 block"
          style={{ color: 'var(--color-text-subtle)' }}
        >
          {label}
        </span>
      </span>
      <button
        type="button"
        onClick={onAdd}
        disabled={plusDisabled}
        aria-label={tr('quickMarks.ariaLabelAdd', { label })}
        title={plusDisabled ? disabledReason : undefined}
        className="num"
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          border: `1px solid ${activeColor}`,
          backgroundColor: activeColor,
          color: 'white',
          fontSize: 18,
          fontWeight: 600,
          cursor: plusDisabled ? 'not-allowed' : 'pointer',
          opacity: plusDisabled ? 0.5 : 1,
          flexShrink: 0,
        }}
      >
        +
      </button>
    </span>
  );
}

function OffToggle({ on, onToggle, tr }: { on: boolean; onToggle: () => void; tr: any }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? tr('quickMarks.ariaLabelRemove', { label: tr('quickMarks.labelOff') }) : tr('quickMarks.ariaLabelAdd', { label: tr('quickMarks.labelOff') })}
      className="rounded-lg border flex flex-col items-center justify-center"
      style={{
        minHeight: 44,
        borderColor: on ? 'var(--color-text-subtle)' : 'var(--color-border)',
        backgroundColor: on ? 'var(--color-text-subtle)' : 'var(--color-bg)',
        color: on ? 'white' : 'var(--color-text)',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 14 }}>
        {on ? (<><span aria-hidden="true">✓</span> {tr('quickMarks.labelOff')}</>) : tr('quickMarks.labelOff')}
      </span>
      <span className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: on ? 'white' : 'var(--color-text-subtle)', opacity: on ? 0.85 : 1 }}>
        {tr('quickMarks.labelNoClass')}
      </span>
    </button>
  );
}
