import { useState, useEffect, useRef } from 'react';
import { t, resolveLocale, STORAGE_KEY, fmt, type Locale } from '../../lib/i18n';

export interface DraftSlot {
  dayOfWeek: number; // 0=Sun .. 6=Sat
  startTime: string; // HH:MM (24-hour, internal)
  endTime: string;
  subjectId: string;
  subjectName: string;
  isLab: boolean;
  location?: string;
}

interface Entry {
  id: string;
  name: string;
  color: string;
  isLab: boolean;
}

interface Props {
  initialSlots: DraftSlot[];
  initialSubjects: Entry[];
  sessionId: string;
  isOnboarding?: boolean;
}

const DAYS_FULL = [
  { short: 'Sun', long: 'Sunday' },
  { short: 'Mon', long: 'Monday' },
  { short: 'Tue', long: 'Tuesday' },
  { short: 'Wed', long: 'Wednesday' },
  { short: 'Thu', long: 'Thursday' },
  { short: 'Fri', long: 'Friday' },
  { short: 'Sat', long: 'Saturday' },
];

function generateUniqueId(): string {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return 'c_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getRandomColor(seed?: string): string {
  let h: number;
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    h = Math.abs(hash % 360);
  } else {
    h = Math.floor(Math.random() * 360);
  }
  // We use 70% saturation and 45% lightness for vibrant, accessible colors on light/dark backgrounds
  return hslToHex(h, 70, 45);
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}


function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function fromMin(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** "08:00" -> "8 AM" */
function fmt12(t: string): string {
  const m = toMin(t);
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const ap = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return mm === 0 ? `${h12} ${ap}` : `${h12}:${String(mm).padStart(2, '0')} ${ap}`;
}

function sortByTime(slots: DraftSlot[]): DraftSlot[] {
  return [...slots].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
}


export default function WeeklyGrid({ initialSlots, initialSubjects, sessionId, isOnboarding = false }: Props) {
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

  const localizedDays = [
    { short: tr('day.short.sun'), long: tr('day.long.sun') },
    { short: tr('day.short.mon'), long: tr('day.long.mon') },
    { short: tr('day.short.tue'), long: tr('day.long.tue') },
    { short: tr('day.short.wed'), long: tr('day.long.wed') },
    { short: tr('day.short.thu'), long: tr('day.long.thu') },
    { short: tr('day.short.fri'), long: tr('day.long.fri') },
    { short: tr('day.short.sat'), long: tr('day.long.sat') },
  ];

  const splitEntries = (pool: Entry[]): { subjects: Entry[]; labs: Entry[] } => {
    const subjects: Entry[] = [];
    const labs: Entry[] = [];
    for (const e of pool) (e.isLab ? labs : subjects).push(e);
    return { subjects, labs };
  };

  const initialSplit = splitEntries(initialSubjects);
  const [subjects, setSubjects] = useState<Entry[]>(initialSplit.subjects as Entry[]);
  const [labs, setLabs] = useState<Entry[]>(initialSplit.labs as Entry[]);
  const [slots, setSlots] = useState<DraftSlot[]>(initialSlots);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasMounted = useRef(false);
  // Track latest state so we can flush on unmount / beforeunload
  const latestRef = useRef({ subjects, labs, slots });
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { latestRef.current = { subjects, labs, slots }; }, [subjects, labs, slots]);

  function buildPayload(
    currentSubjects: Entry[],
    currentLabs: Entry[],
    currentSlots: DraftSlot[],
  ) {
    return {
      subjects: [
        ...currentSubjects.map((s) => ({ tempId: s.id, name: s.name, color: s.color, isLab: false })),
        ...currentLabs.map((s) => ({ tempId: s.id, name: s.name, color: s.color, isLab: true })),
      ],
      slots: currentSlots.map((s) => {
        return {
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          subjectTempId: s.subjectId,
          location: s.location,
        };
      }),
    };
  }

  async function syncTimetable(
    currentSubjects: Entry[],
    currentLabs: Entry[],
    currentSlots: DraftSlot[],
    shouldRedirect = false
  ) {
    const payload = buildPayload(currentSubjects, currentLabs, currentSlots);

    if (shouldRedirect) setSaving(true);
    else setAutoSaving(true);

    try {
      const res = await fetch(`/api/timetable?sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null) as { error?: { message?: string } } | null;
        const detail = errBody?.error?.message || `HTTP ${res.status}`;
        console.error('[WeeklyGrid] save failed', res.status, errBody);
        if (shouldRedirect) setSaveError(`Failed to save: ${detail}`);
        return;
      }
      // Save succeeded — clear pending flag
      pendingTimer.current = null;
      if (shouldRedirect) {
        window.location.href = '/app/today';
      }
    } catch (e) {
      console.error('[WeeklyGrid] save network error', e);
      if (shouldRedirect) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setSaveError(`Network error: ${msg}`);
      }
    } finally {
      setSaving(false);
      setAutoSaving(false);
    }
  }

  // Flush pending changes via sendBeacon when the user navigates away
  // (beforeunload fires before Astro's page transitions and hard navigations).
  useEffect(() => {
    function flushBeacon() {
      if (!pendingTimer.current) return;
      const { subjects: s, labs: l, slots: sl } = latestRef.current;

      const payload = buildPayload(s, l, sl);
      const url = `/api/timetable?sessionId=${encodeURIComponent(sessionId)}`;
      // fetch with keepalive survives page unload (like sendBeacon) but allows PUT
      fetch(url, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
      pendingTimer.current = null;
    }
    window.addEventListener('beforeunload', flushBeacon);
    // Also flush on Astro's before-preparation (soft nav)
    document.addEventListener('astro:before-preparation', flushBeacon);
    return () => {
      window.removeEventListener('beforeunload', flushBeacon);
      document.removeEventListener('astro:before-preparation', flushBeacon);
      // Component unmount — flush if pending
      flushBeacon();
    };
  }, [sessionId]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      syncTimetable(subjects, labs, slots, false);
    }, 1000);
    pendingTimer.current = timer;
    return () => clearTimeout(timer);
  }, [subjects, labs, slots]);

  const [addForDay, setAddForDay] = useState<number | null>(null);
  const [entryName, setEntryName] = useState<string>('');
  const [entryIsLab, setEntryIsLab] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    function onImport(e: Event) {
      const detail = (e as CustomEvent).detail as DraftSlot[];
      if (!Array.isArray(detail)) return;
      const newSubjects: Entry[] = [];
      const newLabs: Entry[] = [];
      for (const sl of detail) {
        const target = sl.isLab ? newLabs : newSubjects;
        const existing = sl.isLab ? labs : subjects;
        if (!existing.some((x) => x.name === sl.subjectName) && !target.some((x) => x.name === sl.subjectName)) {
          target.push({ id: generateUniqueId(), name: sl.subjectName, color: getRandomColor(sl.subjectName), isLab: sl.isLab });
        }
      }

      const finalSlots = detail.map((sl) => {
        const pool = sl.isLab ? [...labs, ...newLabs] : [...subjects, ...newSubjects];
        const entry = pool.find((x) => x.name === sl.subjectName);
        return {
          ...sl,
          subjectId: entry?.id || generateUniqueId(),
        };
      });

      if (newSubjects.length) setSubjects((arr) => [...arr, ...newSubjects]);
      if (newLabs.length) setLabs((arr) => [...arr, ...newLabs]);
      setSlots((arr) => [...arr, ...finalSlots]);
    }
    window.addEventListener('at75:import-slots', onImport);
    return () => window.removeEventListener('at75:import-slots', onImport);
  }, [subjects, labs]);

  function addSubject() {
    setSubjects([
      ...subjects,
      { id: generateUniqueId(), name: `Subject ${subjects.length + 1}`, color: getRandomColor(), isLab: false },
    ]);
  }

  function addLab() {
    setLabs([
      ...labs,
      { id: generateUniqueId(), name: `Lab ${labs.length + 1}`, color: getRandomColor(), isLab: true },
    ]);
  }

  function renameInPool(kind: 'subject' | 'lab', idx: number, newName: string) {
    if (kind === 'subject') {
      setSubjects(subjects.map((x, j) => (j === idx ? { ...x, name: newName } : x)));
    } else {
      setLabs(labs.map((x, j) => (j === idx ? { ...x, name: newName } : x)));
    }
  }

  function removeFromPool(kind: 'subject' | 'lab', idx: number) {
    const pool = kind === 'subject' ? subjects : labs;
    const removedId = pool[idx]?.id;
    if (kind === 'subject') {
      setSubjects(subjects.filter((_, i) => i !== idx));
    } else {
      setLabs(labs.filter((_, i) => i !== idx));
    }
    if (removedId) setSlots((prev) => prev.filter((s) => s.subjectId !== removedId));
  }

  function openAddForDay(day: number) {
    const isLab = labs.length > 0 && subjects.length === 0;
    const defaultName = isLab
      ? (labs[0]?.name ?? '')
      : (subjects[0]?.name ?? '');
    setAddForDay(day);
    setEntryName(defaultName);
    setEntryIsLab(isLab);
    setStartTime('09:00');
    setEndTime('10:00');
    setLocation('Room ');
  }

  function closeAddForDay() {
    setAddForDay(null);
  }

  function confirmAddClass() {
    if (addForDay === null) return;
    if (!entryName.trim()) {
      setSaveError(tr('weeklyGrid.errorPickSubject'));
      return;
    }
    if (toMin(endTime) <= toMin(startTime)) {
      setSaveError(tr('weeklyGrid.errorTimeOrder'));
      return;
    }
    setSaveError(null);
    const pool = entryIsLab ? labs : subjects;
    const entry = pool.find((x) => x.name === entryName);
    if (!entry) {
      setSaveError(tr('weeklyGrid.errorNotExists'));
      return;
    }
    setSlots((arr) => [
      ...arr,
      {
        dayOfWeek: addForDay,
        startTime,
        endTime,
        subjectId: entry.id,
        subjectName: entry.name,
        isLab: entry.isLab,
        location: location.trim() || undefined,
      },
    ]);
    setAddForDay(null);
  }

  function removeSlot(idx: number) {
    setSlots(slots.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="text-base font-semibold">{tr('weeklyGrid.addSubjectsTitle')}</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-subtle)' }}>
          {tr('weeklyGrid.addSubjectsBody')}
        </p>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <PoolEditor
            kind="subject"
            title={tr('weeklyGrid.subjects')}
            entries={subjects}
            onAdd={addSubject}
            onRename={(idx, name) => renameInPool('subject', idx, name)}
            onRemove={(idx) => removeFromPool('subject', idx)}
            tr={tr}
          />
          <PoolEditor
            kind="lab"
            title={tr('weeklyGrid.labs')}
            entries={labs}
            onAdd={addLab}
            onRename={(idx, name) => renameInPool('lab', idx, name)}
            onRemove={(idx) => removeFromPool('lab', idx)}
            emptyHint={tr('weeklyGrid.noLabs')}
            tr={tr}
          />
        </div>
      </section>

      <section className="card">
        <h2 className="text-base font-semibold">{tr('weeklyGrid.buildScheduleTitle')}</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-subtle)' }}>
          {tr('weeklyGrid.buildScheduleBody')}
        </p>

        <div className="mt-4 space-y-2">
          {DAYS_FULL.map((_, dayIdx) => {
            const todays = sortByTime(slots.filter((s) => s.dayOfWeek === dayIdx));
            const dayNameLong = localizedDays[dayIdx]?.long || '';
            return (
              <div
                key={dayIdx}
                className="rounded-md border p-3 flex flex-col gap-2"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                }}
              >
                <div className="flex w-full items-center justify-between gap-3 pr-2">
                  <div className="font-semibold">{dayNameLong}</div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openAddForDay(dayIdx)}
                    aria-label={`${tr('weeklyGrid.addClass')} ${dayNameLong}`}
                  >
                    {tr('weeklyGrid.addClass')}
                  </button>
                </div>

                {todays.length === 0 && addForDay !== dayIdx && (
                  <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                    {tr('weeklyGrid.noClasses')}
                  </p>
                )}

                {todays.length > 0 && (
                  <ul className="space-y-1">
                    {todays.map((sl) => {
                      const globalIdx = slots.findIndex(
                        (s) =>
                          s.dayOfWeek === sl.dayOfWeek &&
                          s.startTime === sl.startTime &&
                          s.endTime === sl.endTime &&
                          s.subjectId === sl.subjectId
                      );
                      const pool = sl.isLab ? labs : subjects;
                      const entry = pool.find((x) => x.id === sl.subjectId);
                      const name = entry?.name ?? sl.subjectName;
                      const color = entry?.color ?? '#3b82f6';
                      return (
                        <li
                          key={`${sl.dayOfWeek}-${sl.startTime}-${sl.subjectId}`}
                          className="flex flex-wrap items-center gap-2 rounded-md border p-2 text-sm"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <span
                            aria-hidden="true"
                            style={{ width: 4, alignSelf: 'stretch', borderRadius: 3, backgroundColor: color, flexShrink: 0, minHeight: 28 }}
                          />
                          <span className="font-medium">{name}</span>
                          {sl.isLab && (
                            <span
                              className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
                              style={{ backgroundColor: 'color-mix(in oklab, var(--color-brand-500) 18%, transparent)', color: 'var(--color-brand-600)' }}
                            >
                              {tr('weeklyGrid.labLabel')}
                            </span>
                          )}
                          <span className="num text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                            {fmt12(sl.startTime)} – {fmt12(sl.endTime)}
                          </span>
                          {sl.location && (
                            <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                              · {sl.location}
                            </span>
                          )}
                          <div className="ml-auto flex gap-1">
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => removeSlot(globalIdx)}
                              aria-label={`${tr('weeklyGrid.remove')} ${name} ${fmt12(sl.startTime)}`}
                            >
                              {tr('weeklyGrid.remove')}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {addForDay === dayIdx && (
                  <div
                    className="rounded-md border p-3"
                    style={{ borderColor: 'var(--color-brand-500)', backgroundColor: 'var(--color-surface-2)' }}
                  >
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                      <div className="field col-span-2 sm:col-span-1 min-w-0">
                        <label className="field-label" htmlFor={`name-${dayIdx}`}>{tr('weeklyGrid.subjectOrLab')}</label>
                        <select
                          id={`name-${dayIdx}`}
                          className="select"
                          value={entryName}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setEntryName(newName);
                            // auto-detect type from the pool.
                            const inLabs = labs.some((l) => l.name === newName);
                            setEntryIsLab(inLabs);
                          }}
                          aria-label={tr('weeklyGrid.subjectOrLab')}
                        >
                          {subjects.length === 0 && labs.length === 0 && <option value="">{tr('weeklyGrid.addSubjectOrLabFirst')}</option>}
                          {subjects.length > 0 && (
                            <optgroup label={tr('weeklyGrid.subjects')}>
                              {subjects.map((s) => (
                                <option key={`subj-${s.name}`} value={s.name}>{s.name}</option>
                              ))}
                            </optgroup>
                          )}
                          {labs.length > 0 && (
                            <optgroup label={tr('weeklyGrid.labs')}>
                              {labs.map((l) => (
                                <option key={`lab-${l.name}`} value={l.name}>{l.name}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4 sm:gap-5 min-w-0">
                        <div className="field col-span-1 min-w-0 pr-1.5 sm:pr-0">
                          <label className="field-label text-xs sm:text-sm" htmlFor={`start-${dayIdx}`}>{tr('weeklyGrid.start')}</label>
                          <div className="relative">
                            <input
                              id={`start-${dayIdx}`}
                              type="time"
                              className="input num pr-2 sm:pr-7 w-full min-w-0 text-xs sm:text-sm"
                              value={startTime}
                              onChange={(e) => {
                                const v = e.target.value;
                                  setStartTime(v);
                                  // If end <= start, push end to start+1h
                                  if (toMin(v) >= toMin(endTime)) {
                                    setEndTime(fromMin(Math.min(toMin(v) + 60, 23 * 60 + 59)));
                                  }
                              }}
                              aria-label={tr('weeklyGrid.start')}
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 hidden sm:flex items-center pr-1.5" style={{ color: 'var(--color-text-subtle)' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m6 9 6 6 6-6"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="field col-span-1 min-w-0 pl-1.5 sm:pl-0">
                          <label className="field-label text-xs sm:text-sm" htmlFor={`end-${dayIdx}`}>{tr('weeklyGrid.end')}</label>
                          <div className="relative">
                            <input
                              id={`end-${dayIdx}`}
                              type="time"
                              className="input num pr-2 sm:pr-7 w-full min-w-0 text-xs sm:text-sm"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              aria-label={tr('weeklyGrid.end')}
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 hidden sm:flex items-center pr-1.5" style={{ color: 'var(--color-text-subtle)' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m6 9 6 6 6-6"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="field col-span-2 sm:col-span-2 min-w-0">
                        <label className="field-label" htmlFor={`loc-${dayIdx}`}>{tr('weeklyGrid.locationLabel')}</label>
                        <input
                          id={`loc-${dayIdx}`}
                          type="text"
                          className="input"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder={tr('weeklyGrid.roomPlaceholder')}
                          aria-label={tr('weeklyGrid.locationLabel')}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={closeAddForDay}
                        aria-label={tr('weeklyGrid.cancel')}
                      >
                        {tr('weeklyGrid.cancel')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={confirmAddClass}
                      >
                        {tr('weeklyGrid.add')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {saveError && (
        <div
          role="alert"
          className="card"
          style={{ borderColor: 'var(--color-danger)', backgroundColor: 'color-mix(in oklab, var(--color-danger) 8%, var(--color-bg))' }}
        >
          <div className="flex items-start gap-2">
            <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}>⚠</span>
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--color-danger)' }}>{tr('weeklyGrid.couldNotSave')}</p>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>{saveError}</p>
            </div>
            <button
              type="button"
              onClick={() => setSaveError(null)}
              className="btn btn-ghost btn-sm"
              aria-label={tr('weeklyGrid.cancel')}
              style={{ minHeight: 32, minWidth: 32, padding: '2px 8px' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <span
          className="text-xs"
          style={{ color: 'var(--color-text-subtle)', minWidth: '8rem', textAlign: 'right' }}
          aria-live="polite"
        >
          {isOnboarding && (saving || autoSaving
            ? tr('weeklyGrid.saving')
            : saveError
              ? tr('weeklyGrid.saveFailed')
              : '')}
        </span>
        <button
          className="btn btn-primary"
          onClick={() => syncTimetable(subjects, labs, slots, true)}
          type="button"
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? tr('weeklyGrid.saving') : tr('weeklyGrid.saveAndContinue')}
        </button>
      </div>
    </div>
  );
}


function PoolEditor({
  kind, title, entries, onAdd, onRename, onRemove, emptyHint, tr,
}: {
  kind: 'subject' | 'lab';
  title: string;
  entries: Entry[];
  onAdd: () => void;
  onRename: (idx: number, name: string) => void;
  onRemove: (idx: number) => void;
  emptyHint?: string;
  tr: (key: string) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onAdd}
          aria-label={tr(kind === 'lab' ? 'weeklyGrid.addLab' : 'weeklyGrid.addSubject')}
        >
          {tr(kind === 'lab' ? 'weeklyGrid.addLab' : 'weeklyGrid.addSubject')}
        </button>
      </div>
      {entries.length === 0 && emptyHint && (
        <p className="mt-2 text-xs" style={{ color: 'var(--color-text-subtle)' }}>{emptyHint}</p>
      )}
      <ul className="mt-2 space-y-2">
        {entries.map((s, i) => (
          <li 
            key={s.id} 
            className="flex items-center gap-2 rounded-md border p-1 pl-2 pr-2" 
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
          >
            <span
              aria-hidden="true"
              style={{ width: 4, height: 24, borderRadius: 2, backgroundColor: s.color, flexShrink: 0 }}
            />
            <input
              className="input flex-1 border-none! ring-0! shadow-none! outline-none! bg-transparent"
              style={{ padding: '2px 8px', border: 'none' }}
              value={s.name}
              onChange={(e) => onRename(i, e.target.value)}
              placeholder={kind === 'lab' ? tr('weeklyGrid.labNamePlaceholder') : tr('weeklyGrid.subjectNamePlaceholder')}
              aria-label={`${title} ${i + 1} name`}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm h-auto min-w-0 p-1"
              onClick={() => onRemove(i)}
              aria-label={`${tr('weeklyGrid.remove')} ${s.name}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
