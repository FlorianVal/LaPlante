---
phase: 04-watering-confirmation-and-tablet-polish
plan: 01
subsystem: ui
tags: [react, css-modules, tablet, tap-interaction, watering-confirmation]

requires:
  - phase: 03-plant-creation-and-photos
    provides: PlantRow with photo rendering, DayCell component, api.ts with createPlant, usePlants hook with refresh
  - phase: 01-server-and-domain-foundation
    provides: POST /api/plants/:id/waterings endpoint, PlantResponse with schedule summary

provides:
  - confirmWatering API client calling POST /api/plants/:id/waterings
  - Clickable DayCell with role=button, tabIndex, aria-label, keyboard support
  - onConfirmWatering callback chain from Timeline through PlantRow to DayCell
  - Rectangular cell dimensions (56x48) for tablet tap targets
  - CSS transition (0.25s ease) on background-color for overdue-to-green animation
  - Toast error on failed watering confirmation

affects: [04-02-PLAN, tablet-polish]

tech-stack:
  added: []
  patterns:
    - "CSS touch-action: manipulation for preventing double-tap zoom on interactive elements"
    - "Callback threading through component hierarchy: Timeline -> PlantRow -> DayCell"

key-files:
  created: []
  modified:
    - apps/web/src/lib/api.ts
    - apps/web/src/styles/tokens.css
    - apps/web/src/components/DayCell/DayCell.tsx
    - apps/web/src/components/DayCell/DayCell.module.css
    - apps/web/src/components/PlantRow/PlantRow.tsx
    - apps/web/src/components/Timeline/Timeline.tsx
    - apps/web/src/App.tsx
    - apps/web/src/components/DateHeader/DateHeader.module.css
    - apps/web/src/components/LoadingSkeleton/LoadingSkeleton.module.css

key-decisions:
  - "Only overdue DayCells get onClick; future and empty cells remain non-interactive"
  - "No success toast on watering confirmation -- the visual update (yellow-to-green) is the feedback"
  - "touch-action: manipulation as inline style only on clickable cells to prevent tablet double-tap zoom"
  - "CELL_WIDTH constant (56px) used for NowMarker positioning, matching --cell-width token"

patterns-established:
  - "Conditional interactivity: DayCell receives onClick only when cellState === overdue"
  - "Error-only toast pattern: success feedback via visual state change, failure via toast message"

requirements-completed: [WATR-01, WATR-02, WATR-03, WATR-04, TIME-05]

duration: 4min
completed: 2026-05-03
---

# Phase 4 Plan 1: Watering Confirmation Interaction Summary

**Tap-to-confirm watering on overdue cells with confirmWatering API client, rectangular 56x48 cells, and yellow-to-green CSS transition**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-03T21:45:37Z
- **Completed:** 2026-05-03T21:50:23Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- confirmWatering API client calls POST /api/plants/:id/waterings with date window query params
- Overdue DayCell is tappable with pointer cursor, active scale animation, and keyboard accessibility
- Full callback chain: App provides refresh+toast -> Timeline handles confirm+refresh -> PlantRow threads to overdue cells -> DayCell renders as button
- Cell dimensions migrated from square 48px to rectangular 56x48 for better horizontal tap targets
- DateHeader and LoadingSkeleton CSS updated to match new --cell-width token

## Task Commits

Each task was committed atomically:

1. **Task 1: Add confirmWatering to api.ts, rectangular cell tokens, and DayCell tap interaction** - `e901c21` (feat)
2. **Task 2: Wire onConfirmWatering through Timeline and PlantRow, update grid template** - `c793868` (feat)

## Files Created/Modified
- `apps/web/src/lib/api.ts` - Added confirmWatering function for POST /api/plants/:id/waterings
- `apps/web/src/styles/tokens.css` - Replaced --cell-size (48px) with --cell-width (56px) and --cell-height (48px)
- `apps/web/src/components/DayCell/DayCell.tsx` - Added onClick, plantName props, role=button, tabIndex, aria-label, onKeyDown, touch-action
- `apps/web/src/components/DayCell/DayCell.module.css` - Added .clickable cursor/active styles, background-color transition, migrated to --cell-width/--cell-height
- `apps/web/src/components/PlantRow/PlantRow.tsx` - Added onConfirmWatering prop, passes onClick only on overdue cells
- `apps/web/src/components/Timeline/Timeline.tsx` - Added handleConfirmWatering with confirmWatering+refresh, CELL_WIDTH=56, --cell-width in grid template
- `apps/web/src/App.tsx` - Passes onRefresh and onToastError to Timeline
- `apps/web/src/components/DateHeader/DateHeader.module.css` - Migrated from --cell-size to --cell-width
- `apps/web/src/components/LoadingSkeleton/LoadingSkeleton.module.css` - Migrated from --cell-size to --cell-width

## Decisions Made
- Only overdue DayCells get onClick; future and empty cells remain non-interactive to avoid accidental taps
- No success toast on watering confirmation -- the visual state change (yellow-to-green transition at 0.25s) provides sufficient feedback per design spec
- touch-action: manipulation applied only to clickable cells to prevent tablet double-tap zoom delay

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Migrated DateHeader and LoadingSkeleton from --cell-size to --cell-width**
- **Found during:** Task 2 (grid template update)
- **Issue:** Removing --cell-size token broke DateHeader.module.css and LoadingSkeleton.module.css which still referenced var(--cell-size), causing grid misalignment
- **Fix:** Updated all remaining var(--cell-size) references to var(--cell-width) in DateHeader.module.css (1 occurrence) and LoadingSkeleton.module.css (2 occurrences)
- **Files modified:** apps/web/src/components/DateHeader/DateHeader.module.css, apps/web/src/components/LoadingSkeleton/LoadingSkeleton.module.css
- **Verification:** grep for --cell-size returns 0 matches; Vite build passes; server tests pass
- **Committed in:** c793868 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed import path for confirmWatering in Timeline.tsx**
- **Found during:** Task 2 (TypeScript compilation)
- **Issue:** Used '../lib/api' instead of '../../lib/api' -- Timeline is nested two levels deep under components/Timeline/
- **Fix:** Corrected to '../../lib/api' matching the pattern used by AddPlantModal
- **Files modified:** apps/web/src/components/Timeline/Timeline.tsx
- **Verification:** tsc --noEmit passes with 0 errors
- **Committed in:** c793868 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Core watering confirmation loop complete: overdue cell visible, tappable, records watering, refreshes timeline
- Rectangular cells (56x48) provide adequate tablet tap targets
- Ready for 04-02: tablet kiosk configuration (viewport meta, Vite LAN host), automated persistence smoke tests

---
*Phase: 04-watering-confirmation-and-tablet-polish*
*Completed: 2026-05-03*

## Self-Check: PASSED

All 9 modified files verified present. Both task commits (e901c21, c793868) verified in git log.
