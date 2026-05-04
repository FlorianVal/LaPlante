---
phase: 02-timeline-main-screen
plan: 02
subsystem: ui
tags: [react, hooks, polling, scrollIntoView, api-integration, mock-fallback]

# Dependency graph
requires:
  - phase: 01-server-and-domain-foundation
    provides: "PlantResponse types, date helpers, Fastify server API"
  - phase: 02-timeline-main-screen
    provides: "React/Vite web app scaffold, Timeline components, API client, mock data"
provides:
  - "usePlants hook with 60s polling, mock fallback, midnight crossover detection"
  - "useCurrentTime hook for now marker time display"
  - "scroll-to-today centering via scrollIntoView on grid load"
  - "data-date attributes on day cells for scroll targeting"
affects: [03-plant-creation-and-photos, 04-watering-confirmation-and-tablet-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [custom-hooks-with-polling, scrollintoview-centering, mock-data-fallback-pattern, midnight-crossover-detection]

key-files:
  created:
    - apps/web/src/hooks/usePlants.ts
    - apps/web/src/hooks/useCurrentTime.ts
  modified:
    - apps/web/src/App.tsx
    - apps/web/src/components/Timeline/Timeline.tsx
    - apps/web/src/components/DateHeader/DateHeader.tsx
    - apps/web/src/components/DayCell/DayCell.tsx
    - apps/web/src/components/PlantRow/PlantRow.tsx

key-decisions:
  - "usePlants falls back to mock data only on first load failure; subsequent failures keep existing data"
  - "scrollIntoView uses behavior: 'instant' (not 'smooth') for immediate centering at load"
  - "requestAnimationFrame wraps scrollIntoView to ensure grid is painted before scroll"
  - "DayCell accepts optional date prop for data-date attribute, keeps backward compatibility"

patterns-established:
  - "Polling hook pattern: useState + useEffect + setInterval with cleanup, useCallback for stable reference"
  - "Midnight crossover: useRef tracks last seen date, sets loading=true on date change to re-trigger scroll"
  - "data-date attributes on grid cells for DOM-based scroll targeting via querySelector"

requirements-completed: [TIME-01, TIME-03, TIME-05]

# Metrics
duration: 5min
completed: 2026-05-03
---

# Phase 2 Plan 02: API Integration and Live Data Summary

**usePlants hook with 60s polling and mock-data fallback wired to Timeline, scroll-to-today centering via scrollIntoView on load and midnight crossover**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-03T17:22:23Z
- **Completed:** 2026-05-03T17:28:17Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created usePlants hook that fetches from the Fastify API with 60-second polling interval
- Created useCurrentTime hook providing live clock for the now marker (updates every 60s)
- Wired App.tsx to use both hooks, removing direct mock data dependency
- Added scroll-to-today centering using scrollIntoView({ behavior: 'instant', inline: 'center' })
- Added data-date attributes to DateHeader and DayCell components for scroll targeting
- Mock data fallback works when server is unavailable (first load only)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create data hooks (usePlants, useCurrentTime)** - `522cf69` (feat)
2. **Task 2: Wire App.tsx and Timeline with live data and scroll-to-today** - `7653509` (feat)

## Files Created/Modified
- `apps/web/src/hooks/usePlants.ts` - Data fetching hook with 60s polling, mock fallback, midnight crossover
- `apps/web/src/hooks/useCurrentTime.ts` - Current time hook with configurable update interval
- `apps/web/src/App.tsx` - Replaced mock data with usePlants and useCurrentTime hooks
- `apps/web/src/components/Timeline/Timeline.tsx` - Added gridRef, scroll-to-today useEffect, data-date querySelector
- `apps/web/src/components/DateHeader/DateHeader.tsx` - Added data-date attribute to header cells
- `apps/web/src/components/DayCell/DayCell.tsx` - Added optional date prop with data-date attribute
- `apps/web/src/components/PlantRow/PlantRow.tsx` - Passes date prop to DayCell for data-date

## Decisions Made
- usePlants falls back to mock data only on first load failure; subsequent failures keep existing data and show error state
- scrollIntoView uses `behavior: 'instant'` for immediate centering at load (not 'smooth' animation)
- requestAnimationFrame wraps scrollIntoView to ensure the grid DOM is painted before scroll attempt
- DayCell's date prop is optional, maintaining backward compatibility for any non-scroll use cases

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing node_modules in worktree**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** Worktree was created without node_modules; all TypeScript checks failed with "Cannot find module 'react'" errors
- **Fix:** Ran `npm install` and `npm --workspace @laplante/shared run build` to restore dependencies
- **Files modified:** node_modules/ (restored), packages/shared/dist/ (rebuilt)
- **Verification:** TypeScript compiles cleanly after install
- **Committed in:** 522cf69 (preparation for Task 1)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for TypeScript compilation in worktree. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Timeline grid now fetches live data from the Fastify server with polling
- Mock data fallback keeps the UI functional when the server is down
- scroll-to-today centering works at load and on midnight crossover
- All component interfaces accept real PlantResponse data
- Ready for Phase 3: Plant Creation and Photos

---
*Phase: 02-timeline-main-screen*
*Completed: 2026-05-03*

## Self-Check: PASSED

- All 8 key files verified present on disk
- Both task commits (522cf69, 7653509) verified in git log
- TypeScript compiles cleanly: `npx tsc -p apps/web/tsconfig.json --noEmit` exits 0
- Vite build succeeds: `node_modules/.bin/vite build apps/web` exits 0
