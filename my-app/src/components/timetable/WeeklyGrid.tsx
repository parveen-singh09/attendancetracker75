import { useState, useEffect, useRef } from 'react';

export interface DraftSlot {
  dayOfWeek: number; // 0=Sun .. 6=Sat
  startTime: string; // HH:MM (24-hour, internal)
  endTime: string;
  subjectName: string;
  isLab: boolean;
  location?: string;
}

interface Entry {
  id?: string;
  name: string;
  color: string;
  isLab: boolean;
}

interface Props {
  initialSlots: DraftSlot[];
  initialSubjects: Entry[];
  sessionId: string;
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

const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];


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


export default function WeeklyGrid({ initialSlots, initialSubjects, sessionId }: Props) {
  const splitEntries = (pool: Entry[]): { subjects: Entry[]; labs: Entry[] } => {
    const subjects: Entry[] = [];
    const labs: Entry[] = [];
    for (const e of pool) (e.isLab ? labs : subjects).push(e);
    return { subjects, labs };
  };

  const initialSplit = splitEntries(initialSubjects);
  const [subjects, setSubjects] = useState<Entry[]>(
    initialSplit.subjects.length ? initialSplit.subjects : [{ name: 'Subject 1', color: PALETTE[0]!, isLab: false }]
  );
  const [labs, setLabs] = useState<Entry[]>(
    initialSplit.labs.length ? initialSplit.labs : [{ name: 'Lab 1', color: PALETTE[1]!, isLab: true }]
  );
  const [slots, setSlots] = useState<DraftSlot[]>(initialSlots);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasMounted = useRef(false);

  async function syncTimetable(
    currentSubjects: Entry[],
    currentLabs: Entry[],
    currentSlots: DraftSlot[],
    shouldRedirect = false
  ) {
    if (currentSubjects.length === 0 && currentLabs.length === 0) {
      if (shouldRedirect) setSaveError('Please add at least one subject to continue.');
      return;
    }
    if (currentSlots.length === 0 && !shouldRedirect) return;

    const payload = {
      subjects: [
        ...currentSubjects.map((s, i) => ({ tempId: `s${i}`, name: s.name, color: s.color, isLab: false })),
        ...currentLabs.map((s, i) => ({ tempId: `l${i}`, name: s.name, color: s.color, isLab: true })),
      ],
      slots: currentSlots.map((s) => {
        const subjIdx = currentSubjects.findIndex((x) => x.name === s.subjectName);
        const labIdx = currentLabs.findIndex((x) => x.name === s.subjectName);
        const tempId = s.isLab ? `l${labIdx}` : `s${subjIdx}`;
        return {
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          subjectTempId: tempId,
          location: s.location,
        };
      }),
    };

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

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      syncTimetable(subjects, labs, slots, false);
    }, 1000);
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
      const usedColors = new Set([...subjects, ...labs].map((x) => x.color));
      const newSubjects: Entry[] = [];
      const newLabs: Entry[] = [];
      for (const sl of detail) {
        const target = sl.isLab ? newLabs : newSubjects;
        const existing = sl.isLab ? labs : subjects;
        if (!existing.some((x) => x.name === sl.subjectName) && !target.some((x) => x.name === sl.subjectName)) {
          const color =
            PALETTE.find((c) => !usedColors.has(c) && !target.some((x) => x.color === c)) ?? PALETTE[0]!;
          usedColors.add(color);
          target.push({ name: sl.subjectName, color, isLab: sl.isLab });
        }
      }
      if (newSubjects.length) setSubjects((arr) => [...arr, ...newSubjects]);
      if (newLabs.length) setLabs((arr) => [...arr, ...newLabs]);
      setSlots((arr) => [...arr, ...detail]);
    }
    window.addEventListener('at75:import-slots', onImport);
    return () => window.removeEventListener('at75:import-slots', onImport);
  }, [subjects, labs]);

  function nextColor(used: Set<string>): string {
    return PALETTE.find((c) => !used.has(c)) ?? PALETTE[used.size % PALETTE.length]!;
  }

  function addSubject() {
    const used = new Set(subjects.map((s) => s.color));
    setSubjects([
      ...subjects,
      { name: `Subject ${subjects.length + 1}`, color: nextColor(used), isLab: false },
    ]);
  }

  function addLab() {
    const used = new Set([...subjects, ...labs].map((s) => s.color));
    setLabs([
      ...labs,
      { name: `Lab ${labs.length + 1}`, color: nextColor(used), isLab: true },
    ]);
  }

  function renameInPool(kind: 'subject' | 'lab', idx: number, newName: string) {
    const pool = kind === 'subject' ? subjects : labs;
    const oldName = pool[idx]?.name;
    if (oldName === newName) return;
    if (kind === 'subject') {
      setSubjects(subjects.map((x, j) => (j === idx ? { ...x, name: newName } : x)));
    } else {
      setLabs(labs.map((x, j) => (j === idx ? { ...x, name: newName } : x)));
    }
    if (oldName) {
      setSlots(slots.map((s) => (s.subjectName === oldName ? { ...s, subjectName: newName } : s)));
    }
  }

  function removeFromPool(kind: 'subject' | 'lab', idx: number) {
    const removedName = (kind === 'subject' ? subjects[idx] : labs[idx])?.name;
    if (kind === 'subject') {
      setSubjects(subjects.filter((_, i) => i !== idx));
    } else {
      setLabs(labs.filter((_, i) => i !== idx));
    }
    if (removedName) setSlots(slots.filter((s) => s.subjectName !== removedName));
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
      setSaveError('Please pick a subject or lab.');
      return;
    }
    if (toMin(endTime) <= toMin(startTime)) {
      setSaveError('End time must be after start time.');
      return;
    }
    setSaveError(null);
    const pool = entryIsLab ? labs : subjects;
    const entry = pool.find((x) => x.name === entryName);
    if (!entry) {
      setSaveError('That entry no longer exists.');
      return;
    }
    setSlots((arr) => [
      ...arr,
      {
        dayOfWeek: addForDay,
        startTime,
        endTime,
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
      {}
      <section className="card">
        <h2 className="text-base font-semibold">1. Add subjects and labs</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-subtle)' }}>
          Add your subjects and labs. You&apos;ll assign them to days in the next step.
        </p>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <PoolEditor
            kind="subject"
            title="Subjects"
            entries={subjects}
            onAdd={addSubject}
            onRename={(idx, name) => renameInPool('subject', idx, name)}
            onRemove={(idx) => removeFromPool('subject', idx)}
            onColorChange={(idx, color) =>
              setSubjects((arr) => arr.map((x, j) => (j === idx ? { ...x, color } : x)))
            }
            palette={PALETTE}
          />
          <PoolEditor
            kind="lab"
            title="Labs"
            entries={labs}
            onAdd={addLab}
            onRename={(idx, name) => renameInPool('lab', idx, name)}
            onRemove={(idx) => removeFromPool('lab', idx)}
            onColorChange={(idx, color) =>
              setLabs((arr) => arr.map((x, j) => (j === idx ? { ...x, color } : x)))
            }
            palette={PALETTE}
            emptyHint="No labs yet. Click + Add lab to create one."
          />
        </div>
      </section>

      {}
      <section className="card">
        <h2 className="text-base font-semibold">2. Build your weekly schedule</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-subtle)' }}>
          For each day, add the classes you attend. Pick a subject or lab from the pool above, and set the time.
        </p>

        <div className="mt-4 space-y-2">
          {DAYS_FULL.map((d, dayIdx) => {
            const todays = sortByTime(slots.filter((s) => s.dayOfWeek === dayIdx));
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
                  <div className="font-semibold">{d.long}</div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openAddForDay(dayIdx)}
                    aria-label={`Add class to ${d.long}`}
                  >
                    + Add class
                  </button>
                </div>

                {todays.length === 0 && addForDay !== dayIdx && (
                  <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                    No classes and labs.
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
                          s.subjectName === sl.subjectName
                      );
                      const pool = sl.isLab ? labs : subjects;
                      const entry = pool.find((x) => x.name === sl.subjectName);
                      const color = entry?.color ?? '#3b82f6';
                      return (
                        <li
                          key={`${sl.dayOfWeek}-${sl.startTime}-${sl.subjectName}`}
                          className="flex flex-wrap items-center gap-2 rounded-md border p-2 text-sm"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <span
                            aria-hidden="true"
                            style={{ width: 4, alignSelf: 'stretch', borderRadius: 3, backgroundColor: color, flexShrink: 0, minHeight: 28 }}
                          />
                          <span className="font-medium">{sl.subjectName}</span>
                          {sl.isLab && (
                            <span
                              className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
                              style={{ backgroundColor: 'color-mix(in oklab, var(--color-brand-500) 18%, transparent)', color: 'var(--color-brand-600)' }}
                            >
                              Lab
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
                              aria-label={`Remove ${sl.subjectName} ${fmt12(sl.startTime)} from ${d.long}`}
                            >
                              Remove
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
                        <label className="field-label" htmlFor={`name-${dayIdx}`}>Subject or lab</label>
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
                          aria-label="Pick a subject or lab"
                        >
                          {subjects.length === 0 && labs.length === 0 && <option value="">— add a subject or lab first —</option>}
                          {subjects.length > 0 && (
                            <optgroup label="Subjects">
                              {subjects.map((s) => (
                                <option key={`subj-${s.name}`} value={s.name}>{s.name}</option>
                              ))}
                            </optgroup>
                          )}
                          {labs.length > 0 && (
                            <optgroup label="Labs">
                              {labs.map((l) => (
                                <option key={`lab-${l.name}`} value={l.name}>{l.name}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4 sm:gap-5 min-w-0">
                        <div className="field col-span-1 min-w-0 pr-1.5 sm:pr-0">
                          <label className="field-label text-xs sm:text-sm" htmlFor={`start-${dayIdx}`}>Start</label>
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
                              aria-label="Start time"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 hidden sm:flex items-center pr-1.5" style={{ color: 'var(--color-text-subtle)' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m6 9 6 6 6-6"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="field col-span-1 min-w-0 pl-1.5 sm:pl-0">
                          <label className="field-label text-xs sm:text-sm" htmlFor={`end-${dayIdx}`}>End</label>
                          <div className="relative">
                            <input
                              id={`end-${dayIdx}`}
                              type="time"
                              className="input num pr-2 sm:pr-7 w-full min-w-0 text-xs sm:text-sm"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              aria-label="End time"
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
                        <label className="field-label" htmlFor={`loc-${dayIdx}`}>Location (optional)</label>
                        <input
                          id={`loc-${dayIdx}`}
                          type="text"
                          className="input"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Room 204"
                          aria-label="Location"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={closeAddForDay}
                        aria-label="Cancel"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={confirmAddClass}
                      >
                        Add
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
              <p className="font-medium" style={{ color: 'var(--color-danger)' }}>Couldn&apos;t save</p>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>{saveError}</p>
            </div>
            <button
              type="button"
              onClick={() => setSaveError(null)}
              className="btn btn-ghost btn-sm"
              aria-label="Dismiss error"
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
          {saving
            ? 'Saving…'
            : saveError
              ? 'Save failed'
              : autoSaving
                ? 'Saving…'
                : subjects.length + labs.length + slots.length > 0
                  ? 'All changes saved ✓'
                  : ''}
        </span>
        <button
          className="btn btn-primary"
          onClick={() => syncTimetable(subjects, labs, slots, true)}
          type="button"
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? 'Saving…' : 'Save & Continue' /* btn.saveAndContinue / btn.saving */}
        </button>
      </div>
    </div>
  );
}


function PoolEditor({
  kind, title, entries, onAdd, onRename, onRemove, onColorChange, palette, emptyHint,
}: {
  kind: 'subject' | 'lab';
  title: string;
  entries: Entry[];
  onAdd: () => void;
  onRename: (idx: number, name: string) => void;
  onRemove: (idx: number) => void;
  onColorChange: (idx: number, color: string) => void;
  palette: string[];
  emptyHint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onAdd}
          aria-label={`Add ${kind}`}
        >
          + Add {kind}
        </button>
      </div>
      {entries.length === 0 && emptyHint && (
        <p className="mt-2 text-xs" style={{ color: 'var(--color-text-subtle)' }}>{emptyHint}</p>
      )}
      <ul className="mt-2 space-y-1.5">
        {entries.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: s.color, flexShrink: 0 }}
            />
            <input
              className="input flex-1"
              value={s.name}
              onChange={(e) => onRename(i, e.target.value)}
              placeholder={kind === 'lab' ? 'Lab name' : 'Subject name'}
              aria-label={`${title} ${i + 1} name`}
            />
            <ColorSwatchPicker
              value={s.color}
              palette={palette}
              onChange={(c) => onColorChange(i, c)}
              ariaLabel={`${title} ${i + 1} color`}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onRemove(i)}
              aria-label={`Remove ${s.name}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    document.querySelectorAll('details.color-picker[open]').forEach((d) => {
      if (!d.contains(target)) d.removeAttribute('open');
    });
  });
}


function ColorSwatchPicker({
  value, palette, onChange, ariaLabel,
}: {
  value: string;
  palette: string[];
  onChange: (c: string) => void;
  ariaLabel: string;
}) {
  return (
    <details className="relative color-picker">
      <summary
        aria-label={ariaLabel}
        className="list-none cursor-pointer"
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            backgroundColor: value,
          }}
        />
      </summary>
      <div
        role="listbox"
        aria-label={ariaLabel}
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          zIndex: 20,
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4,
        }}
      >
        {palette.map((c) => {
          const selected = c.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={c}
              onClick={() => onChange(c)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: selected
                  ? '2px solid var(--color-text)'
                  : '2px solid transparent',
                padding: 0,
                cursor: 'pointer',
                backgroundColor: c,
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
              }}
            />
          );
        })}
      </div>
    </details>
  );
}
