---
phase: 02-timeline-main-screen
verified: 2026-05-03T17:45:00Z
status: passed
score: 12/12 must-haves verified
gaps:
  []
human_verification:
  - test: "Load the app at localhost:5173 on a 1024x768 viewport"
    expected: "Timeline grid renders as the first screen with 5 plant rows, day cells, green/amber dots, sticky name column, sticky date header, and blue now-marker with time badge"
    why_human: "Visual layout verification at specific viewport dimensions requires human eye"
  - test: "Start the Fastify server, then start the web dev server, and observe the grid"
    expected: "Grid loads live plant data from the API and auto-scrolls to center on today"
    why_human: "Requires running two dev servers and observing live scroll behavior"
  - test: "Wait 60 seconds on a running app and observe if data refreshes silently"
    expected: "Data refreshes without visual disruption (no flash, no layout shift)"
    why_human: "Polling behavior is time-dependent and visual; cannot verify with static analysis"
  - test: "Load the app without the Fastify server running"
    expected: "Grid renders with 5 mock plants as fallback data"
    why_human: "Requires starting only the web dev server without the API server and observing fallback behavior"
---

# Phase 2: Timeline Main Screen Verification Report

**Phase Goal:** Build the tablet-first watering timeline as the main screen.
**Verified:** 2026-05-03T17:45:00Z
**Status:** Passed (with human verification items)
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

**From Plan 02-01 (Timeline Scaffold):**

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The app renders a day-based timeline grid as the main screen | VERIFIED | Timeline.tsx (104 lines) uses CSS Grid, generates 15-day date range, renders as full viewport. App.tsx renders Timeline as the sole child. CSS: `display: grid`, `height: 100vh` |
| 2 | Each plant appears as one row with stable 64px row height | VERIFIED | PlantRow.tsx (55 lines) renders one row per plant. CSS: `height: var(--row-height)` (64px in tokens.css). `display: contents` on row wrapper so children participate in parent grid |
| 3 | A vertical blue now-marker line spans all rows at the today column | VERIFIED | NowMarker.tsx (28 lines) renders vertical line + time badge. CSS: `background: var(--color-now-marker)` (#3b82f6), `width: var(--marker-width)` (2px). Left offset calculated from todayIndex |
| 4 | Future watering dates show as green filled circles in their day cells | VERIFIED | DayCell.tsx (26 lines) renders `styles.dot` when state is 'future'. CSS: `.future .dot { background: var(--color-accent) }` (#22c55e), `border-radius: 50%`, `width: var(--dot-size)` (20px) |
| 5 | Overdue dates show as amber filled circles in their day cells | VERIFIED | DayCell.tsx renders dot when state is 'overdue'. CSS: `.overdue .dot { background: var(--color-overdue) }` (#f59e0b). PlantRow.getCellState() computes overdue state from schedule.isOverdue and overdueSince |
| 6 | The grid has a sticky 160px plant name column and sticky date header row | VERIFIED | PlantRow.module.css: `position: sticky; left: 0` on nameColumn, `width: var(--name-column-width)` (160px). DateHeader.module.css: `position: sticky; top: 0` on cells. Corner cell: `z-index: 3; position: sticky; left: 0; top: 0` |
| 7 | The layout is readable on a 1024x768 tablet viewport | VERIFIED (needs human) | Fixed dimensions match UI-SPEC: 48px cells, 64px rows, 160px name column, 2px gaps. CSS uses overflow-auto for scrollability. Human verification needed for visual confirmation |

**From Plan 02-02 (API Integration):**

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 8 | The timeline loads real plant data from the API when the server is running | VERIFIED | usePlants.ts (58 lines) calls `fetchPlants(window.from, window.to)` which hits `GET /api/plants?from=...&to=...`. api.ts (12 lines) implements the fetch. App.tsx wires usePlants to Timeline via plants prop |
| 9 | The grid auto-scrolls to center on today at load time | VERIFIED | Timeline.tsx lines 51-62: `useEffect` triggers `scrollIntoView({ behavior: 'instant', inline: 'center' })` wrapped in `requestAnimationFrame`. Targets `[data-date="${todayStr}"]` via querySelector |
| 10 | Data silently refreshes every 60 seconds without visual disruption | VERIFIED | usePlants.ts line 44: `setInterval(..., POLL_INTERVAL_MS)` where POLL_INTERVAL_MS = 60_000. Data replacement via `setPlants(data)` does not reset loading state on successful fetch |
| 11 | The grid re-centers on today when the date changes (midnight crossover) | VERIFIED | usePlants.ts lines 46-49: compares `todayISO()` against `lastDateRef.current`, sets `loading=true` on date change. Timeline.tsx useEffect re-triggers on `[loading, plants]` change |
| 12 | Mock data is used as fallback when the server is not available | VERIFIED | usePlants.ts line 34: `setPlants((prev) => (prev.length === 0 ? getMockPlants() : prev))` -- falls back to mock data on first failure, keeps existing data on subsequent failures |

**Score:** 12/12 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/web/package.json` | Web app package with React, Vite, date-fns, lucide-react | VERIFIED | 26 lines, contains all required deps |
| `apps/web/vite.config.ts` | Vite config with React plugin and API proxy | VERIFIED | 14 lines, `@vitejs/plugin-react`, proxy `/api` to localhost:3000 |
| `apps/web/src/styles/tokens.css` | CSS custom properties for all design tokens | VERIFIED | 50 lines, all UI-SPEC tokens present: colors, spacing, typography, grid dimensions |
| `apps/web/src/components/Timeline/Timeline.tsx` | Main timeline grid container | VERIFIED | 104 lines (min 40), all imports wired, scroll-to-today, conditional rendering |
| `apps/web/src/components/DateHeader/DateHeader.tsx` | Sticky top row with day labels | VERIFIED | 35 lines (min 20), data-date attributes, Today label, dayOfMonth/dayOfWeek |
| `apps/web/src/components/PlantRow/PlantRow.tsx` | One row per plant with name and day cells | VERIFIED | 55 lines (min 25), imports DayCell, Flower2 icon, getCellState logic |
| `apps/web/src/components/DayCell/DayCell.tsx` | Single day cell with empty/future/overdue states | VERIFIED | 26 lines (min 15), state-driven rendering, dot element, data-date attribute |
| `apps/web/src/components/NowMarker/NowMarker.tsx` | Vertical current-time marker with time badge | VERIFIED | 28 lines (min 15), position calculation, formatTime, blue line + badge |
| `apps/web/src/lib/mock-data.ts` | Hardcoded PlantResponse[] matching UI-SPEC | VERIFIED | 106 lines, contains `mock-fern`, 5 plants with relative dates |
| `apps/web/src/hooks/usePlants.ts` | Data fetching hook with polling, loading/error states | VERIFIED | 58 lines (min 30), exports usePlants, 60s polling, mock fallback, midnight detection |
| `apps/web/src/hooks/useCurrentTime.ts` | Current time hook for now marker | VERIFIED | 12 lines (min 10), exports useCurrentTime, configurable interval |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| PlantRow.tsx | DayCell.tsx | Renders DayCell for each date | WIRED | Import on line 4, renders `<DayCell>` in dates.map() loop |
| Timeline.tsx | DateHeader.tsx | Renders DateHeader as sticky top row | WIRED | Import on line 4, renders `<DateHeader dates={dates} today={today} />` |
| Timeline.tsx | NowMarker.tsx | Renders NowMarker overlay aligned to today column | WIRED | Import on line 6, renders `<NowMarker>` with todayIndex and position constants |
| Timeline.tsx | mock-data.ts (via usePlants) | Mock data fallback | WIRED | usePlants.ts imports getMockPlants on line 5, calls on line 34 when API fails |
| App.tsx | Timeline.tsx | Renders Timeline as the main screen | WIRED | Import on line 1, renders `<Timeline>` with all props from hooks |
| App.tsx | usePlants.ts | Data fetching with 60s polling | WIRED | Import on line 2, destructures `{ plants, loading, error, retry }` |
| App.tsx | useCurrentTime.ts | Current time for now marker | WIRED | Import on line 3, passes `currentTime={currentTime}` to Timeline |
| Timeline.tsx | today cell element | scrollIntoView centering | WIRED | gridRef + querySelector(`[data-date="${todayStr}"]`) + scrollIntoView |
| usePlants.ts | api.ts | Calls fetchPlants on interval | WIRED | Import on line 4, calls `fetchPlants(window.from, window.to)` in useCallback |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| Timeline.tsx | `plants` (from props) | App.tsx -> usePlants hook | Yes -- fetches from API or falls back to mock data | FLOWING |
| Timeline.tsx | `currentTime` (from props) | App.tsx -> useCurrentTime hook | Yes -- `new Date()` updated every 60s | FLOWING |
| usePlants.ts | `plants` (useState) | `fetchPlants()` API call | Yes -- `GET /api/plants?from=...&to=...` returns PlantResponse[] | FLOWING |
| usePlants.ts | fallback data | `getMockPlants()` | Yes -- 5 mock plants with dynamic dates | FLOWING |
| PlantRow.tsx | cell states | `getCellState()` from plant.schedule | Yes -- uses futureWateringDates, isOverdue, overdueSince | FLOWING |
| NowMarker.tsx | `leftOffset` | Calculated from todayIndex * cell dimensions | Yes -- computed from dates array and constants | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compiles cleanly | `npm install && npx tsc -p apps/web/tsconfig.json --noEmit` | Exits 0 after npm install | PASS |
| Vite build succeeds | `node_modules/.bin/vite build apps/web` | Built in 937ms, produces index.html + CSS + JS | PASS |
| Design tokens in build output | `grep "color-accent.*#22c55e" dist CSS` | All tokens present in built CSS | PASS |
| API client exports correct function | `api.ts` exports `fetchPlants(from, to)` | Function present, calls `/api/plants?from=${from}&to=${to}` | PASS |
| Mock data contains required plants | `mock-data.ts` exports `getMockPlants()` with 5 plants | Contains mock-fern, mock-cactus, mock-orchid, mock-snake-plant, mock-aloe-vera | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| TIME-01 | 02-01, 02-02 | User sees a day-based timeline table as the main screen | SATISFIED | Timeline.tsx renders CSS Grid timeline as the sole content of App.tsx. App is the root component |
| TIME-02 | 02-01 | Each plant is displayed on its own timeline row | SATISFIED | PlantRow.tsx renders one row per plant with 64px fixed height. Timeline.tsx maps plants to PlantRow components |
| TIME-03 | 02-01, 02-02 | The current date/time is represented by a vertical marker centered on the screen | SATISFIED | NowMarker.tsx renders vertical blue line with HH:mm time badge. scrollIntoView centers on today column |
| TIME-04 | 02-01 | Future watering dates are displayed as small green cells to the right of the current marker | SATISFIED | DayCell.tsx renders 20px green circles for 'future' state. PlantRow.getCellState() identifies future dates from schedule.futureWateringDates |
| TIME-05 | 02-01, 02-02 | Timeline layout remains readable and aligned on a tablet viewport | SATISFIED (needs human) | Fixed dimensions (48px cells, 64px rows, 160px name column) with overflow scroll. CSS Grid ensures alignment. Sticky elements for context during scroll |

No orphaned requirements found. All 5 TIME requirements are covered by at least one plan.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | - |

No anti-patterns detected. No TODO/FIXME comments, no empty return statements, no console.log stubs, no hardcoded empty arrays flowing to rendering.

**Note on npm install:** During verification, `node_modules` was missing for the web app (React, Vite, and all web dependencies were not installed). TypeScript compilation initially showed 78 errors. After running `npm install`, compilation succeeded cleanly. This appears to be an environment issue (worktree or fresh checkout without install) rather than a code defect. The SUMMARY self-checks claim TypeScript passed, which is consistent with the code being correct -- the dependencies just needed installation.

### Human Verification Required

### 1. Tablet viewport layout
**Test:** Load the app at localhost:5173 in a browser set to 1024x768 viewport dimensions
**Expected:** Timeline grid renders as the first screen with 5 plant rows, day cells showing green/amber dots, sticky name column visible during horizontal scroll, sticky date header visible during vertical scroll, and blue now-marker line with time badge centered on today's column
**Why human:** Visual layout verification at specific viewport dimensions and scroll behavior requires human observation

### 2. Live API data loading and scroll-to-today
**Test:** Start the Fastify server (`npm run dev:server`), then start the web dev server (`cd apps/web && npx vite`), open localhost:5173
**Expected:** Grid loads live plant data from the API and auto-scrolls to center on today's column immediately on page load
**Why human:** Requires running two dev servers and observing live scroll-to-today behavior

### 3. 60-second polling refresh
**Test:** Keep the app running and wait 60+ seconds observing the grid
**Expected:** Data silently refreshes without visual disruption (no loading skeleton flash, no layout shift)
**Why human:** Polling behavior is time-dependent; silent refresh must be visually confirmed

### 4. Mock data fallback
**Test:** Start ONLY the web dev server (not the Fastify server) and open localhost:5173
**Expected:** Grid renders with 5 mock plants (Fern, Cactus, Orchid, Snake Plant, Aloe Vera) as fallback data
**Why human:** Requires observing behavior with server unavailable

### Gaps Summary

No gaps found. All 12 must-have truths are verified with substantive evidence in the codebase. All artifacts exist, are substantive, are wired into the rendering tree, and have real data flowing through them. TypeScript compilation and Vite build both succeed (after `npm install`). All 5 TIME requirements have implementation evidence.

The only caveat is that `node_modules` was not installed at verification time, which prevented TypeScript compilation initially. This is an environment/installation issue, not a code defect.

---

_Verified: 2026-05-03T17:45:00Z_
_Verifier: Claude (gsd-verifier)_
