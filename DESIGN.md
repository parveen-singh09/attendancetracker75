# Attendance Tracker — Design Document

**Product:** Attendance Tracker
**Domain:** [attendancetrack75.com](https://attendancetrack75.com)
**Project name:** `attendancetrack75`
**Stack:** Astro 6 (SSR) · TypeScript · Tailwind CSS v4 · Better Auth · PostgreSQL (via Drizzle ORM) · Claude API (timetable extraction)
**Repo:** `attendance-calculator/` (Astro project lives in [`my-app/`](my-app/))
**Date:** 2026-06-02

---

## 1. Problem statement

Existing attendance tools (e.g. attendance75.com, generic "attendance calculator" sites) are **stateless arithmetic machines**:
enter two numbers, get a percentage and a "bunk" count. They assume the student does the bookkeeping manually.

We don't. A student already lives in a timetable — Monday 9am is always Calculus. The hard part of tracking attendance is the daily logging, not the math. Attendance Tracker takes the timetable as input (typed, uploaded, or AI-extracted from an image), then turns the boring "did I go today?" question into a one-tap, daily habit.

### 1.1 User story

> As a college student, I open the app on Monday morning, see today's three classes, and tap "Present / Absent / Off" on each. By Friday, the app already knows my percentage per subject, my bunk budget, and which class I should not skip next.

### 1.2 Scope (v1)

| In scope | Out of scope |
| --- | --- |
| Email + password auth (signup/login) | OAuth (Google/Apple) — v2 |
| Weekly timetable (manual + AI-from-image) | Semester-wide auto-import from college ERP — v2 |
| Daily attendance logging with three states (Present / Absent / Off) | Location-based auto check-in — v2 |
| Subject-wise + overall percentage | Attendance predictions/ML — v2 |
| Bunk calculator + recovery calculator | Push notifications — v2 |
| Session (semester) rollup | Sharing timetables with classmates — v2 |
| Dark mode, mobile-first responsive | Native iOS/Android apps — out of scope |
| Export JSON / CSV | PDF reports — v2 |

---

## 2. Competitive landscape & differentiation

### 2.1 What competitors offer (baseline)

Based on review of [attendance75.com](https://attendance75.com) and similar "fast accurate smart" attendance calculator sites:

| Feature | Competitor A (attendance75) | Competitor B (generic) |
| --- | --- | --- |
| Two-number % calc | ✅ | ✅ |
| Bunk calculator | ✅ | ❌ |
| Recovery calculator | ✅ | ❌ |
| What-if simulator | ✅ (attend/miss one) | ❌ |
| Custom target % | ✅ | partial |
| **Login / accounts** | ❌ | ❌ |
| **Timetable import** | ❌ | ❌ |
| **Daily logging** | ❌ | ❌ |
| **Subject-wise tracking** | ❌ | ❌ |
| **Holiday / off-day** | ❌ | ❌ |
| **Session / semester rollup** | ❌ | ❌ |
| **History & streaks** | ❌ | ❌ |
| **Dark mode** | ❌ | ❌ |

**The gap:** every "attendance calculator" on the market is a stateless widget. None remember who you are. None know your schedule. None give you a daily habit loop.

### 2.2 How we beat them (without copying their UI)

1. **Stateful by design.** Login → own timetable → own history. Data persists across devices.
2. **AI timetable onboarding.** User photographs/pastes their timetable; we parse it with a vision model and pre-fill the schedule. Competitors make you type the two numbers yourself.
3. **Daily habit loop.** "Today" view surfaces exactly the classes that need a tap. Three states — Present, Absent, Off — match real life (Off = holiday, cancelled class, sick leave, off-day).
4. **Subject-aware math.** Per-subject % plus a weighted overall. Bunk budget shown *per subject* so the student can decide which class is safest to skip.
5. **Streaks and trends.** Per-subject "currently safe / at risk / below target" badge. Recent-7-days sparkline. Nothing on the market shows this.
6. **Session semantics.** "Fall 2026" → "Spring 2027" carryover; archive old sessions; export.
7. **Privacy-first by default.** Account data is encrypted at rest; user can one-click export everything; we never sell or share.
8. **Free.** No paywall. No "Pro" tier in v1. The whole product is free.
9. **Design parity.** Mobile-first, dark mode by default, accessible, fast (Astro SSR + minimal JS).

---

## 3. Information architecture

```
/                      Marketing landing + login CTA
/signup                Create account
/login                 Sign in
/forgot-password       Reset flow

/app                   Authenticated app shell (sidebar/topbar)
  /app/today           Daily view (default landing)
  /app/calendar        Month view, history
  /app/subjects        Per-subject deep-dive
  /app/calculator      Standalone quick calculator
  /app/sessions        List of academic sessions
  /app/sessions/[id]   Single session rollup
  /app/settings        Profile, theme, data export, delete account

/onboarding            First-run flow (3 steps)
  /onboarding/welcome
  /onboarding/session
  /onboarding/timetable  (manual | AI-from-image | AI-from-text)

/legal/privacy
/legal/terms
/about
```

Routes are file-based in `my-app/src/pages/`. Authed routes are SSR-only and gated by middleware (see §9).

---

## 4. Core user flows

### 4.1 Onboarding (first-time user)

1. **Welcome** — value prop, "Start tracking in 2 minutes."
2. **Session setup** — name ("Fall 2026"), start date, end date, target % (default 75, slider 50–100).
3. **Timetable setup** — three tabs:
   - **Manual:** grid for Mon–Sat × period-1…period-8. Pick subject per cell.
   - **From text:** paste a free-form timetable block; LLM returns structured JSON; user reviews.
   - **From image:** upload a photo/screenshot; vision model returns structured JSON; user reviews.
4. **Confirmation screen** — "Today is Monday Sept 8. Your first class is Calculus at 9:00. You're all set." → `/app/today`.

### 4.2 Daily logging (recurring habit, <30 seconds)

User opens `/app/today`:

```
┌────────────────────────────────────────────┐
│ Today · Mon, Sept 8 · 18 days into session│
│ Overall 84%   ▰▰▰▰▰▰▰▰▱  target 75%      │
├────────────────────────────────────────────┤
│ 09:00–10:00  Calculus  101                │
│              [ Present ] [ Absent ] [ Off ]│
├────────────────────────────────────────────┤
│ 10:00–11:00  Data Struct.  Lab             │
│              [ Present ] [ Absent ] [ Off ]│
├────────────────────────────────────────────┤
│ ...                                       │
├────────────────────────────────────────────┤
│ [+ Mark whole day Off (holiday)]          │
└────────────────────────────────────────────┘
```

- Tap a status → saved to DB → counters update in-place → toast `"Saved · Calculus is now 86%"` with undo.
- Bulk "Mark day off" sets every remaining class today to Off and the day to `isHoliday=true`.

### 4.3 Marking a holiday / off-day

Two entry points:
1. **From `/app/today`:** "Mark whole day off" button (shown when 0 logs exist for today).
2. **From `/app/calendar`:** click a date → modal with "Mark as: Holiday · Sick leave · College event · Cancel class." → sets `day.status` and bulk-updates all classes for that date to Off.

A day with `status=off` is **excluded from the denominator** (matches real-world: a holiday doesn't count against you). Sick leave and college event are excluded by default; the user can override per subject (e.g. "Went to lab even though it was a college event").

### 4.4 Percentage + bunk calculator

`/app/calculator` offers the same quick two-number tool the competitors have, but pre-filled from the user's session. Three modes:
- **Overall** — sums all subjects, weighted by class count.
- **Per subject** — pick a subject; see %, can-miss, must-attend.
- **What-if** — toggle "If I attend/miss the next N classes of [subject]" → live preview of new %.

The same calculator logic is also rendered inline on `/app/subjects/[id]` and `/app/today` for the relevant subject.

### 4.5 Session rollup

`/app/sessions/[id]` shows the final report: classes held per subject, attended, %, bunk budget, streak, calendar heatmap, JSON/CSV export.

---

## 5. Data model

PostgreSQL via Drizzle ORM. Schema in [`my-app/src/db/schema.ts`](my-app/src/db/schema.ts).

```ts
// User — managed by Better Auth
users                (id, email, name, image, emailVerified, createdAt)

// Session — academic term
sessions             (id, userId, name, startDate, endDate, targetPct, isArchived, createdAt)

// Subject — a course within a session
subjects             (id, sessionId, name, code, color, credits, minPct, createdAt)

// TimetableSlot — recurring weekly schedule
timetableSlots       (id, sessionId, subjectId, dayOfWeek /* 0-6 */,
                      startTime, endTime, location, isLab, createdAt)

// Day — overrides for specific dates (holiday, sick leave, college event)
days                 (id, sessionId, date /* YYYY-MM-DD */,
                      status /* 'normal' | 'holiday' | 'sick' | 'event' */,
                      note, createdAt)
  UNIQUE (sessionId, date)

// AttendanceLog — one row per class instance
attendanceLogs       (id, sessionId, subjectId, date, status, note, createdAt)
  status: 'present' | 'absent' | 'off'
  UNIQUE (subjectId, date)  -- one log per subject per day
```

### 5.1 Calculation logic (single source of truth)

Implemented in [`my-app/src/lib/attendance.ts`](my-app/src/lib/attendance.ts) and used by both server endpoints and the client island.

```ts
// Per subject over a date range
type Stats = {
  held: number;        // classes that actually happened
  attended: number;    // present logs
  pct: number;         // attended / held * 100
  canMiss: number;     // max consecutive misses while staying >= target
  mustAttend: number;  // classes to attend in a row to recover to target
};

// "Held" = logs that count toward denominator
//   - status='present' or 'absent' → counts
//   - status='off' → never counts
// Day-level overrides cancel all class logs that day unless per-subject override
```

Overall % is computed as `sum(attended) / sum(held) * 100` — weighted by class count, not by credits (matches the way students think about it and how most college portals report).

### 5.2 Storage strategy

- **DB:** PostgreSQL (Neon free tier or Supabase) for accounts, sessions, subjects, timetable, and logs.
- **Client cache:** TanStack Query keeps `/app/today` and `/app/subjects` warm; mutations optimistically update and revalidate.
- **Offline support (v1.1):** Service worker caches the `/app/today` shell and queues status taps via a small `attendanceQueue` in `localStorage` that flushes on reconnect. Out of scope for v1 launch.

---

## 6. Tech stack & rationale

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Astro 6 (SSR via `@astrojs/node`)** | File-based routing, ships zero JS by default, perfect for content + light interactivity. |
| UI | **Astro components + React islands (only where needed)** | Forms, calendar, charts = islands. Marketing, dashboards = pure Astro. |
| Styling | **Tailwind CSS v4** (via `@tailwindcss/vite`) | Per CLAUDE.md convention; v4 is CSS-first with `@theme` blocks. |
| State (client) | **Nano Stores** | Lightweight cross-island state for theme, current session, today logs. |
| Auth | **Better Auth** with email/password | First-class Astro support (per [Astro docs](https://docs.astro.build/en/guides/authentication/#better-auth)). No vendor lock-in. |
| ORM | **Drizzle** | Type-safe, no codegen runtime, plays well with Astro endpoints. |
| DB | **PostgreSQL** (Neon) | Free tier, serverless-friendly, JSON columns for future AI metadata. |
| AI | **Anthropic Claude API** (`claude-sonnet-4-6` for text, vision-capable for image timetables) | Best-in-class structured output and OCR. |
| Validation | **Zod** | Shared between client and server. |
| Charts | **ApexCharts** (React island) | Lightweight, accessible, good defaults. |
| Calendar | **react-day-picker** | Accessible date grid, headless-friendly. |
| Forms | **Astro Actions** for mutations, plain `<form>` for auth | Form posts work without JS, action results rehydrate islands. |
| Email | **Resend** (transactional) | For password reset & welcome. |

### 6.1 Why Astro 6 (and not Next.js / SvelteKit)

Per `CLAUDE.md` the project is committed to Astro 6.4.x with Node ≥ 22.12. Astro's "zero JS by default" model is the right shape for a tool that's mostly forms and read views, and its endpoint system handles the auth + DB + AI proxy without needing a separate backend.

### 6.2 Why client-side islands where used

We hydrate **only** the components that need interaction:
- `<DailyLogGrid client:load />` — status taps
- `<AttendanceChart client:visible />` — renders when scrolled into view
- `<CalendarHeatmap client:visible />` — month grid with click handlers
- `<ThemeToggle client:load />` — needs to be interactive immediately

Everything else (marketing, settings lists, session rollup tables) is server-rendered HTML.

---

## 7. Visual design

### 7.1 Brand

- **Name:** Attendance Tracker
- **Tone:** Calm, factual, slightly playful. "Skip the math, log the day."
- **Wordmark:** Inter, custom kerning. Logomark: a minimal "75" inside a rounded square, accent color tinted.
- **Colors (Tailwind v4 `@theme`):**

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* Brand */
  --color-brand-50:  #f0f7ff;
  --color-brand-500: #2563eb;   /* primary */
  --color-brand-600: #1d4ed8;
  --color-brand-700: #1e40af;

  /* Status */
  --color-safe:   #16a34a;       /* ≥ target */
  --color-warn:   #f59e0b;       /* within 5pp below target */
  --color-danger: #dc2626;       /* below target */

  /* Surfaces (light) */
  --color-bg:        #ffffff;
  --color-surface:   #f8fafc;
  --color-border:    #e2e8f0;
  --color-text:      #0f172a;
  --color-muted:     #64748b;

  /* Surfaces (dark) — applied via .dark class on <html> */
  --color-bg:        #0a0f1c;
  --color-surface:   #111827;
  --color-border:    #1f2937;
  --color-text:      #f1f5f9;
  --color-muted:     #94a3b8;
}
```

### 7.2 Dark mode

- **Default = system preference**, overrideable in settings. Persists to `localStorage.theme`.
- Implementation matches the [Astro tutorial pattern](https://docs.astro.build/en/tutorial/6-islands/2/) — inline `<script is:inline>` in the root layout that runs *before paint* to set `.dark` on `<html>`, preventing FOUC.
- `<html>` carries `class="dark"` (when dark) and `style="color-scheme: dark"` so native form controls and scrollbars theme correctly.
- `<meta name="theme-color">` matches the active surface so mobile browser chrome stays consistent.

### 7.3 Typography

- **Font:** Inter (variable). Self-hosted via `@fontsource-variable/inter`, no Google Fonts request, no CLS.
- **Numerals:** `font-variant-numeric: tabular-nums` on every percentage and class-count number — important for at-a-glance comparison.
- **Headings:** `text-wrap: balance` to avoid widows.
- **Loading states:** all end with `…` (ellipsis), never `...`.
- **Dates/times:** `Intl.DateTimeFormat` (no hardcoded formats).

### 7.4 Layout & spacing

- **Mobile-first.** Single column up to `md`; sidebar nav from `md` up.
- **Containers:** `max-w-3xl` for forms, `max-w-5xl` for dashboards, `max-w-6xl` for marketing.
- **Cards:** rounded-2xl, border + soft shadow, 24px padding.
- **Touch targets:** minimum 44×44 px for all status buttons.

### 7.5 Iconography

- **Lucide** icons throughout (MIT, tree-shakeable, consistent stroke width).
- Every icon button has `aria-label`; decorative icons have `aria-hidden="true"`.

### 7.6 Motion

- Transitions: `transform` and `opacity` only. **Never** `transition: all`.
- Honor `prefers-reduced-motion` — disable slide-in toasts, use instant state changes.
- Toasts slide in 200ms, auto-dismiss 3s, undo window 5s for status changes.

### 7.7 Accessibility checklist (per `web-design-guidelines`)

- Semantic HTML first (`<button>`, `<label>`, `<table>`, `<dialog>` for modals).
- All form inputs have `<label>` + `autocomplete` + correct `type`/`inputmode`.
- Focus-visible rings on all interactive elements (`focus-visible:ring-2 ring-brand-500 ring-offset-2`).
- `aria-live="polite"` for status-saved toasts.
- Skip-link to main content.
- Color is never the only signal — status badges include text + icon.
- No `outline-none` without focus replacement.
- Headings hierarchical; `scroll-margin-top` on anchored headings.
- `<html lang="en">`, `<meta name="viewport" content="width=device-width, initial-scale=1">` (no `user-scalable=no`).

---

## 8. Auth & onboarding

### 8.1 Auth (Better Auth)

- Email + password (bcrypt via Better Auth).
- Password reset via Resend email with a signed token.
- Session cookies: `__Host-session`, `HttpOnly`, `Secure`, `SameSite=Lax`, 30-day expiry.
- Middleware in [`my-app/src/middleware.ts`](my-app/src/middleware.ts) redirects unauthenticated users from `/app/*` to `/login?next=…`.
- All `/app/*` and `/api/*` routes set `export const prerender = false`.

### 8.2 Onboarding state machine

Stored server-side in `users.onboardingStep` (enum: `welcome | session | timetable | done`).
User can re-enter onboarding from `/app/settings → Reset onboarding`.

### 8.3 Timetable extraction (AI)

- **Input:** image (PNG/JPG ≤ 4MB) **or** free-text block.
- **Pipeline:**
  1. Client uploads → `POST /api/timetable/parse` (multipart, signed cookie).
  2. Server stores the raw file in object storage, returns a `parseId`.
  3. Server calls Claude (`claude-sonnet-4-6` with vision) with a strict Zod-validated JSON tool schema asking for `{ slots: [{ dayOfWeek, startTime, endTime, subjectName, location?, isLab }] }`.
  4. Response is validated; failures return a structured error so the user can edit the JSON manually.
  5. User reviews on `/onboarding/timetable` (editable grid), hits Confirm → slots persisted.
- **Cost guardrail:** rate-limit to 5 parses / user / day; cap prompt tokens at 4k; show a one-line estimate ("About 1¢ to parse").
- **Privacy:** raw image is deleted 24h after parse unless user pins it.

---

## 9. API surface (Astro endpoints under `src/pages/api/`)

```
POST  /api/auth/signup            (Better Auth)
POST  /api/auth/login             (Better Auth)
POST  /api/auth/logout
POST  /api/auth/forgot
POST  /api/auth/reset

GET   /api/sessions               list current user's sessions
POST  /api/sessions               create
PATCH /api/sessions/:id
GET   /api/sessions/:id/rollup    computed stats

GET   /api/subjects?session=:id
POST  /api/subjects
PATCH /api/subjects/:id
DELETE /api/subjects/:id

GET   /api/timetable?session=:id
PUT   /api/timetable              replace weekly grid

POST  /api/timetable/parse        multipart image or text → draft slots
GET   /api/timetable/parse/:id    retrieve draft

GET   /api/attendance?date=YYYY-MM-DD
PUT   /api/attendance             upsert a batch of logs for a date
GET   /api/attendance/range?from=&to=
POST  /api/days                   set day status (holiday/sick/event)
DELETE /api/days/:date            clear override

GET   /api/export.json            full account data dump
GET   /api/export.csv             attendance logs as CSV
DELETE /api/account               delete account + cascade
```

All mutating endpoints validate with Zod, return JSON `{ data }` or `{ error: { code, message, field? } }`, and require an authenticated session (except auth endpoints).

---

## 10. SEO, performance, observability

- **SEO:** Per-page `<title>`, `<meta description>`, OG/Twitter cards, JSON-LD `WebApplication` schema on `/`. Sitemap via `@astrojs/sitemap`. `robots.txt` allows all in prod, disallows `/app`, `/api`, `/onboarding`.
- **Performance targets:** LCP < 1.5s on 4G mobile, TBT < 100ms, CLS < 0.05. Astro + Tailwind v4 + minimal islands = easy wins.
- **Preconnect** to `resend.com` (email) and the image host if any.
- **Observability:** Sentry for errors, Plausible for analytics (privacy-friendly, no cookies).
- **Uptime:** Health endpoint at `/api/health` returning `{ ok: true, db: true }`.

---

## 11. Security & privacy

- **CSP:** strict default-src, nonce-based scripts. `frame-ancestors 'none'`.
- **Cookies:** `__Host-` prefix, `HttpOnly`, `Secure`, `SameSite=Lax`.
- **CSRF:** Astro Actions are same-origin; mutating endpoints check `Origin` header.
- **Password hashing:** bcrypt (Better Auth default, 12 rounds).
- **Rate limiting:** Upstash Redis for auth endpoints (5 attempts / 15min / IP) and timetable-parse (5 / day / user).
- **Input validation:** Zod on every endpoint; never trust client-computed percentages.
- **Data export & delete:** GDPR/CCPA-friendly one-click export and hard delete with 30-day grace.
- **Privacy policy** hosted at `/legal/privacy`; updated whenever we add a new processor.

---

## 12. Phased delivery

| Phase | Scope | Status |
| --- | --- | --- |
| **0. Skeleton** | This design doc + remove starter template + add Tailwind v4 + base layout & theme toggle | ✅ starting now |
| **1. Auth** | Better Auth, signup/login/logout/reset, middleware, `/app` shell | ⏭ next |
| **2. Core data** | Drizzle schema, sessions, subjects, timetable (manual), days, logs | |
| **3. Daily logging** | `/app/today`, status taps, day overrides, toasts, optimistic UI | |
| **4. Calculator** | `/app/calculator`, per-subject stats, what-if, overall rollup | |
| **5. Onboarding AI** | Image + text timetable parse, review grid, Claude API wiring | |
| **6. Polish** | Calendar heatmap, streaks, dark-mode polish, export, mobile QA, a11y audit | |
| **7. Launch** | Sitemap, analytics, error tracking, marketing copy, "free forever" landing | |

---

## 13. Open questions

1. **Semester carry-over:** when a new session starts, do we auto-archive the previous one, or prompt the user?
2. **Practical vs lecture:** treat lab/practical as one "held" slot or weight differently? v1 says one slot.
3. **Multi-user / shared timetables:** a class rep enters the timetable, members import it? v2.
4. **Notifications:** in-app only for v1; email digest weekly? Decide before phase 6.
5. **Localization:** v1 English-only; structure i18n keys from day one so v2 is cheap.

---

## 14. File tree (target)

```
my-app/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── public/
│   ├── favicon.svg
│   ├── logo-mark.svg
│   └── robots.txt
├── src/
│   ├── env.d.ts
│   ├── middleware.ts                    # auth + onboarding guard
│   ├── styles/
│   │   ├── global.css                   # Tailwind v4 + @theme tokens
│   │   └── prose.css
│   ├── lib/
│   │   ├── auth.ts                      # Better Auth instance
│   │   ├── auth-client.ts
│   │   ├── db.ts                        # Drizzle client
│   │   ├── schema.ts                    # Drizzle schema
│   │   ├── attendance.ts                # calc logic (held, attended, canMiss…)
│   │   ├── timetable-parser.ts          # Claude API call + Zod schema
│   │   ├── rate-limit.ts                # Upstash
│   │   ├── email.ts                     # Resend
│   │   └── i18n.ts
│   ├── stores/
│   │   ├── theme.ts                     # Nano Store
│   │   └── session.ts
│   ├── components/
│   │   ├── ThemeToggle.astro            # inline script, no-JS friendly
│   │   ├── AppShell.astro               # sidebar + topbar
│   │   ├── NavLink.astro
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   ├── Stat.astro
│   │   │   ├── EmptyState.astro
│   │   │   └── Toast.astro
│   │   ├── attendance/
│   │   │   ├── DailyLogGrid.tsx         # island
│   │   │   ├── AttendanceChart.tsx      # island
│   │   │   ├── CalendarHeatmap.tsx      # island
│   │   │   ├── PercentageBar.astro
│   │   │   ├── BunkCalculator.tsx       # island
│   │   │   └── WhatIfSimulator.tsx      # island
│   │   ├── timetable/
│   │   │   ├── WeeklyGrid.tsx           # island
│   │   │   ├── ParseUploader.tsx        # island
│   │   │   └── SlotEditor.tsx           # island
│   │   └── auth/
│   │       ├── SignupForm.tsx           # island
│   │       └── LoginForm.tsx            # island
│   ├── layouts/
│   │   ├── BaseLayout.astro             # html shell, theme script, meta
│   │   ├── MarketingLayout.astro
│   │   └── AppLayout.astro              # authed shell
│   └── pages/
│       ├── index.astro                  # marketing landing
│       ├── signup.astro
│       ├── login.astro
│       ├── forgot-password.astro
│       ├── about.astro
│       ├── legal/
│       │   ├── privacy.astro
│       │   └── terms.astro
│       ├── onboarding/
│       │   ├── welcome.astro
│       │   ├── session.astro
│       │   └── timetable.astro
│       ├── app/
│       │   ├── today.astro
│       │   ├── calendar.astro
│       │   ├── subjects/
│       │   │   ├── index.astro
│       │   │   └── [id].astro
│       │   ├── calculator.astro
│       │   ├── sessions/
│       │   │   ├── index.astro
│       │   │   └── [id].astro
│       │   └── settings.astro
│       └── api/
│           ├── auth/[...all].ts
│           ├── health.ts
│           ├── sessions/
│           │   ├── index.ts
│           │   ├── [id].ts
│           │   └── [id]/rollup.ts
│           ├── subjects/
│           │   ├── index.ts
│           │   └── [id].ts
│           ├── timetable/
│           │   ├── index.ts
│           │   ├── parse/index.ts
│           │   └── parse/[id].ts
│           ├── attendance/
│           │   ├── index.ts
│           │   └── range.ts
│           ├── days/
│           │   ├── index.ts
│           │   └── [date].ts
│           ├── export.json.ts
│           ├── export.csv.ts
│           └── account.ts
└── .env.example
```

---

## 15. Definition of done (v1)

- [ ] Signup → onboarding → first log in under 2 minutes for a new user.
- [ ] Daily `/app/today` reaches LCP < 1.5s on a throttled 4G Moto G4.
- [ ] Lighthouse a11y score ≥ 95 on `/`, `/app/today`, `/app/calculator`.
- [ ] WCAG 2.1 AA contrast in both light and dark.
- [ ] `prefers-reduced-motion` respected; no `transition: all` anywhere.
- [ ] `web-design-guidelines` review passes (run the skill against the diff).
- [ ] Smoke-tested on iOS Safari, Android Chrome, desktop Firefox/Chrome.
- [ ] All `[a-z-]+` lint-clean, `astro check` clean.
- [ ] No third-party trackers, no cookies set without consent.
- [ ] Privacy policy and Terms live and linked from the footer.
