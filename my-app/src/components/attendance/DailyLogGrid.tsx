import { useState, useEffect } from 'react';
import { t, resolveLocale, STORAGE_KEY, fmt, type Locale } from '../../lib/i18n';

type Status = 'present' | 'absent' | 'extra' | 'off';

interface Slot {
  id: string; 
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  isLab: boolean;
  status: Status | null;
}

interface Props {
  date: string;
  slots: Slot[];
  dayStatus: 'normal' | 'holiday' | 'sick' | 'event';
}

const tones: Record<Status, string> = {
  present: 'var(--color-safe)',
  absent: 'var(--color-danger)',
  extra: 'var(--color-brand-600)',
  off: 'var(--color-text-subtle)',
};

function toMin(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function fmt12(t: string): string {
  if (!t) return '';
  const m = toMin(t);
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const ap = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return mm === 0 ? `${h12} ${ap}` : `${h12}:${String(mm).padStart(2, '0')} ${ap}`;
}

function formatTimeRange(start: string, end: string) {
  const s = fmt12(start);
  const e = fmt12(end);
  if (!s || !e) return '';
  const sAP = s.slice(-2);
  const eAP = e.slice(-2);
  if (sAP === eAP) {
    return `${s.slice(0, -3)}–${e}`;
  }
  return `${s}–${e}`;
}

export default function DailyLogGrid({ date, slots: initialSlots, dayStatus: initialDayStatus }: Props) {
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

  const labels: Record<Status, string> = {
    present: tr('status.present'),
    absent: tr('status.absent'),
    extra: tr('status.extra'),
    off: tr('status.off'),
  };

  const [slots, setSlots] = useState(initialSlots);
  const [dayStatus, setDayStatus] = useState(initialDayStatus);
  const [toast, setToast] = useState<{ message: string; undo?: () => void } | null>(null);

  function showToast(message: string, undo?: () => void) {
    setToast({ message, undo });
    window.setTimeout(() => setToast(null), 4000);
  }

  async function setSlotStatus(slot: Slot, status: Status) {
    const prev = slot.status;
    
    setSlots((arr) => arr.map((s) => (s.id === slot.id ? { ...s, status } : s)));
    try {
      const res = await fetch('/api/attendance', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subjectId: slot.subjectId, date, status }),
      });
      if (!res.ok) throw new Error('Save failed');
      showToast(tr('dailyGrid.toast.marked', { name: slot.subjectName, status: labels[status] }), prev
        ? () => setSlots((arr) => arr.map((s) => (s.id === slot.id ? { ...s, status: prev } : s)))
        : undefined
      );
    } catch (e) {
      
      setSlots((arr) => arr.map((s) => (s.id === slot.id ? { ...s, status: prev } : s)));
      showToast(tr('dailyGrid.toast.saveFailed'));
    }
  }

  async function markDayOff() {
    const prevDay = dayStatus;
    const prevSlots = slots.map((s) => ({ ...s }));
    setDayStatus('holiday');
    setSlots((arr) => arr.map((s) => ({ ...s, status: 'off' })));
    try {
      const res = await fetch('/api/days', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ date, status: 'holiday' }),
      });
      if (!res.ok) throw new Error('Save failed');
      showToast(tr('dailyGrid.toast.dayMarkedHoliday'), () => {
        setDayStatus(prevDay);
        setSlots(prevSlots);
        void fetch('/api/days', {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ date }),
        });
      });
    } catch (e) {
      setDayStatus(prevDay);
      setSlots(prevSlots);
      showToast(tr('dailyGrid.toast.saveFailed'));
    }
  }

  async function clearDayOff() {
    const prevDay = dayStatus;
    setDayStatus('normal');
    try {
      const res = await fetch('/api/days', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      if (!res.ok) throw new Error('Save failed');
      showToast(tr('dailyGrid.toast.holidayCleared'));
    } catch (e) {
      setDayStatus(prevDay);
      showToast(tr('dailyGrid.toast.couldNotSaveGeneric'));
    }
  }

  if (slots.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--color-text-subtle)' }}>{tr('dailyGrid.noClassesScheduled')}</p>
      </div>
    );
  }

  return (
    <div>
      {dayStatus !== 'normal' && (
        <div
          className="mb-3 flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
        >
          <span>
            <strong>{tr('dailyGrid.dayStatus')}</strong> {tr('status.' + dayStatus)}
          </span>
          {dayStatus === 'holiday' && (
            <button className="btn btn-ghost btn-sm" onClick={clearDayOff}>
              {tr('dailyGrid.clear')}
            </button>
          )}
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {slots.map((slot) => (
          <li
            key={slot.id}
            className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div
                aria-hidden="true"
                style={{
                  width: 4,
                  alignSelf: 'stretch',
                  borderRadius: 4,
                  backgroundColor: slot.subjectColor,
                }}
              />
              <div className="flex flex-col gap-1">
                <div className="font-semibold flex items-center gap-2 flex-wrap">
                  {slot.subjectName}
                  {slot.isLab && (
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-subtle)' }}>
                      {tr('dailyGrid.labLabel')}
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium flex items-center flex-wrap gap-2" style={{ color: 'var(--color-text-subtle)' }}>
                  <span className="num">{formatTimeRange(slot.startTime, slot.endTime)}</span>
                  {slot.location && <span className="px-2 py-0.5 rounded-md text-xs font-semibold" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>{slot.location}</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
              {(['present', 'absent', 'off'] as Status[]).map((s) => {
                const active = slot.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlotStatus(slot, s)}
                    aria-pressed={active}
                    aria-label={tr('dailyGrid.ariaLabelMark', { name: slot.subjectName, status: labels[s] })}
                    className="btn px-2 py-1.5 text-xs sm:text-sm"
                    style={{
                      backgroundColor: active ? tones[s] : 'var(--color-bg)',
                      color: active ? 'white' : 'var(--color-text)',
                      borderColor: active ? tones[s] : 'var(--color-border)',
                      borderStyle: 'solid',
                      borderWidth: 1,
                    }}
                  >
                    {labels[s]}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>
          {tr('dailyGrid.tapStatusToLog')}
        </p>
        {dayStatus === 'normal' && (
          <button className="btn btn-secondary btn-sm" onClick={markDayOff} type="button">
            {tr('dailyGrid.markWholeDayOff')}
          </button>
        )}
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
