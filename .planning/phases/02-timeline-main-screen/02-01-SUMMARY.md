---
phase: 02-timeline-main-screen
plan: 01
subsystem: ui
tags: [react, vite, css-modules, css-grid, date-fns, lucide-react, tablet]

# Dependency graph
requires:
  - phase: 01-server-and-domain-foundation
    provides: "PlantResponse types, date helpers, recurrence engine, server API contract"
provides:
  - "React/Vite web app scaffold (apps/web)"
  - "Timeline grid components: Timeline, DateHeader, PlantRow, DayCell, NowMarker"
  - "State components: EmptyState, ErrorState, LoadingSkeleton"
  - "CSS design tokens matching UI-SPEC"
  - "Mock data matching PlantResponse shape for 5 plants"
  - "API client for GET /api/plants"
affects: [03-plant-creation-and-photos, 04-watering-confirmation-and-tablet-polish]

# Tech tracking
tech-stack:
  added: [react@19, vite@6, @vitejs/plugin-react, date-fns@4, lucide-react, css-modules]
  patterns: [css-grid-timeline, sticky-columns-rows, design-tokens-css-custom-properties, mock-data-driven-rendering]

key-files:
  created:
    - apps/web/package.json
    - apps/web/vite.config.ts
    - apps/web/tsconfig.json
    - apps/web/index.html
    - apps/web/src/main.tsx
    - apps/web/src/App.tsx
    - apps/web/src/styles/tokens.css
    - apps/web/src/styles/reset.css
    - apps/web/src/lib/api.ts
    - apps/web/src/lib/mock-data.ts
    - apps/web/src/lib/dates.ts
    - apps/web/src/components/Timeline/Timeline.tsx
    - apps/web/src/components/DateHeader/DateHeader.tsx
    - apps/web/src/components/PlantRow/PlantRow.tsx
    - apps/web/src/components/DayCell/DayCell.tsx
    - apps/web/src/components/NowMarker/NowMarker.tsx
    - apps/web/src/components/EmptyState/EmptyState.tsx
    - apps/web/src/components/ErrorState/ErrorState.tsx
    - apps/web/src/components/LoadingSkeleton/LoadingSkeleton.tsx
  modified: []

key-decisions:
  - "Used CSS Modules with CSS custom properties for design tokens (no Tailwind) per UI-SPEC"
  - "Used CSS Grid with position: sticky for name column and date header (not HTML table)"
  - "Computed visible date window as today-7 to today+7 using shared date helpers"
  - "Mock data generates relative dates dynamically using todayISO and addCalendarDays"
  - "NowMarker positioned absolutely relative to viewport, calculated from todayIndex"
  - "Used bundler module resolution for web tsconfig instead of NodeNext"

patterns-established:
  - "CSS Grid layout: grid-template-columns set via inline style for dynamic column count"
  - "display: contents on row wrappers so grid children participate in parent grid"
  - "Component state via CSS classes: empty/future/overdue cell states"
  - "Conditional rendering: loading/error/empty/data states in Timeline container"

requirements-completed: [TIME-01, TIME-02, TIME-03, TIME-04, TIME-05]

# Metrics
duration: 5min
completed: 2026-05-03
---

# Phase 2 Plan 01: Timeline Scaffold and Components Summary

**React/Vite web app with CSS Grid timeline rendering 5 mock plants, sticky name column and date header, green/amber dot cells, and blue now-marker with time badge**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-03T17:09:26Z
- **Completed:** 2026-05-03T17:15:14Z
- **Tasks:** 2
- **Files modified:** 31

## Accomplishments
- Scaffolded complete apps/web React/Vite application with workspace integration
- Built all 8 timeline components with CSS Modules following UI-SPEC dimensions exactly
- Created CSS custom properties design token system with all colors, spacing, and grid dimensions
- Implemented sticky plant name column (160px) and sticky date header row with proper z-index stacking
- DayCell renders 20px green dots for future watering and amber dots for overdue dates
- NowMarker shows vertical blue line at today column with HH:mm time badge

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold apps/web and set up design tokens** - `c20a89b` (feat)
2. **Task 2: Build all timeline components and wire them together** - `5f470fe` (feat)

## Files Created/Modified

- `apps/web/package.json` - Package manifest with React 19, Vite 6, date-fns, lucide-react
- `apps/web/tsconfig.json` - TypeScript config with react-jsx, bundler module resolution
- `apps/web/vite.config.ts` - Vite config with React plugin and /api proxy
- `apps/web/index.html` - HTML entry point
- `apps/web/src/main.tsx` - React app entry, imports tokens.css and reset.css
- `apps/web/src/App.tsx` - Root component rendering Timeline with mock data
- `apps/web/src/App.module.css` - Full viewport app container
- `apps/web/src/styles/tokens.css` - All CSS custom properties from UI-SPEC
- `apps/web/src/styles/reset.css` - Minimal CSS reset
- `apps/web/src/lib/api.ts` - fetchPlants client for GET /api/plants
- `apps/web/src/lib/dates.ts` - UI date formatting with date-fns (dayOfMonth, dayOfWeek, time)
- `apps/web/src/lib/mock-data.ts` - 5 mock plants with relative date computation
- `apps/web/src/components/Timeline/Timeline.tsx` - Grid container with conditional rendering
- `apps/web/src/components/Timeline/Timeline.module.css` - Grid viewport styles
- `apps/web/src/components/DateHeader/DateHeader.tsx` - Sticky top row with day labels
- `apps/web/src/components/DateHeader/DateHeader.module.css` - Header styles with sticky positioning
- `apps/web/src/components/PlantRow/PlantRow.tsx` - Plant row with sticky name column and DayCells
- `apps/web/src/components/PlantRow/PlantRow.module.css` - Row styles with sticky left
- `apps/web/src/components/DayCell/DayCell.tsx` - Single cell with empty/future/overdue states
- `apps/web/src/components/DayCell/DayCell.module.css` - Cell and dot styles
- `apps/web/src/components/NowMarker/NowMarker.tsx` - Vertical blue line with time badge
- `apps/web/src/components/NowMarker/NowMarker.module.css` - Marker positioning and styles
- `apps/web/src/components/EmptyState/EmptyState.tsx` - Centered empty state with Sprout icon
- `apps/web/src/components/EmptyState/EmptyState.module.css` - Empty state layout
- `apps/web/src/components/ErrorState/ErrorState.tsx` - Error state with retry button
- `apps/web/src/components/ErrorState/ErrorState.module.css` - Error state layout
- `apps/web/src/components/LoadingSkeleton/LoadingSkeleton.tsx` - Pulse animation skeleton grid
- `apps/web/src/components/LoadingSkeleton/LoadingSkeleton.module.css` - Skeleton animation styles

## Decisions Made
- Used CSS Modules with CSS custom properties instead of Tailwind -- the timeline is a focused spatial layout with fixed dimensions, not a multi-page app
- Used CSS Grid with `display: contents` on row wrappers so PlantRow and DateHeader children participate in the parent Timeline grid
- Overrode base tsconfig `module` and `moduleResolution` to `ESNext`/`bundler` for Vite compatibility (base uses NodeNext for server)
- NowMarker positioned as sibling of grid (not inside grid) to avoid z-index conflicts with sticky elements
- Mock data computes dates dynamically relative to today using shared helpers, filtering to the visible window

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Overrode module/moduleResolution in web tsconfig**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** Base tsconfig uses `module: NodeNext` and `moduleResolution: NodeNext` which does not work for Vite browser bundles with JSX
- **Fix:** Added `"module": "ESNext"`, `"moduleResolution": "bundler"`, and `"lib": ["ES2022", "DOM", "DOM.Iterable"]` to web tsconfig compilerOptions
- **Files modified:** apps/web/tsconfig.json
- **Verification:** TypeScript compiles cleanly with `npx tsc -p apps/web/tsconfig.json --noEmit`
- **Committed in:** c20a89b (Task 1 commit)

**2. [Rule 1 - Bug] Built shared package before TypeScript check**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** apps/web references @laplante/shared types but shared package dist was stale, causing TS6305 output file errors
- **Fix:** Ran `npm --workspace @laplante/shared run build` before the web typecheck
- **Files modified:** packages/shared/dist/ (rebuilt)
- **Verification:** TypeScript compiles cleanly after shared rebuild
- **Committed in:** c20a89b (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both necessary for TypeScript compilation. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Timeline grid renders with mock data, ready for live API integration in Plan 02
- All component interfaces (props) are designed to accept real PlantResponse data without changes
- API client (fetchPlants) is implemented but not yet wired to App state
- scrollIntoView centering on today column can be added as a UX enhancement
- usePlants hook with polling and useCurrentTime hook outlined in research but deferred to Plan 02

---
*Phase: 02-timeline-main-screen*
*Completed: 2026-05-03*

## Self-Check: PASSED

- All 21 key files verified present on disk
- Both task commits (c20a89b, 5f470fe) verified in git log
- TypeScript compiles cleanly: `npx tsc -p apps/web/tsconfig.json --noEmit` exits 0
