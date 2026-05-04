# Phase 4: Watering Confirmation and Tablet Polish - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete the daily household loop: see the yellow overdue cell, water the plant, tap the cell to confirm, see the row update with new green cells. Then verify the app works correctly on a tablet in kiosk mode on the local network — proper tap targets, no accidental zoom, auto-refresh, and persistence through refresh/restart.

This phase does NOT include editing/deleting plants (v2), notifications, cloud sync, or multi-user accounts.

</domain>

<decisions>
## Implementation Decisions

### Watering Confirmation Interaction
- **D-01:** The user confirms watering by tapping directly on the yellow overdue cell in the timeline. No separate button or icon.
- **D-02:** Only the overdue cell is tappable. Green future cells and empty cells have no tap interaction.
- **D-03:** The confirmation calls `POST /api/plants/:id/waterings` (already exists on the server).

### Cell Shape and Tap Target
- **D-04:** Cells should be slightly rectangular — wider than tall — for better tap targets on tablet. Current `--cell-size: 48px` square becomes a wider rectangle (width > height). Row height and layout must adapt accordingly.

### Visual Feedback on Confirmation
- **D-05:** When the user taps the overdue cell, it transitions smoothly from yellow to green (0.2-0.3s). No toast notification — the visual change is sufficient feedback.
- **D-06:** After the POST succeeds, the timeline refreshes immediately via `usePlants.refresh()` to show recalculated green cells.

### Tablet Kiosk Mode
- **D-07:** The app is designed for permanent kiosk use — the tablet stays on, displaying the timeline continuously.
- **D-08:** Disable zoom/pinch on tablet via viewport meta tag (`user-scalable=no, maximum-scale=1`).
- **D-09:** The server listens on `0.0.0.0` so the tablet can access it via `http://LOCAL_IP:PORT` on the home network.

### Persistence Verification
- **D-10:** Phase 4 includes verification tests (manual and/or automated) that plants, watering events, and photos survive server restart, browser refresh, and LAN access. No new persistence features — just validation of what Phases 1-3 built.

### Claude's Discretion
- Exact rectangular cell dimensions (width vs height).
- How the tap handler is wired into DayCell (callback prop, click handler, pointer events).
- Transition animation details (CSS transition on background-color and dot color).
- How the server host/port is configured for LAN access.
- Testing approach for persistence verification (automated test script vs manual checklist).
- Whether to add a cursor:pointer or tap highlight on overdue cells.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Scope
- `.planning/PROJECT.md` — Product intent, core value ("obvious which plants need watering now, confirm with one tap"), constraints, and out-of-scope boundaries.
- `.planning/REQUIREMENTS.md` — Phase 4 requirements: WATR-01, WATR-02, WATR-03, WATR-04, SERV-01, TIME-05, PERS-01, PERS-02, PERS-03.
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, and notes (verify tap targets, document local run/access path).

### Prior Phase Context
- `.planning/phases/01-server-and-domain-foundation/01-CONTEXT.md` — API shape, `POST /api/plants/:id/waterings` route, recurrence semantics (D-05: watering resets cadence from confirmation date).
- `.planning/phases/02-timeline-main-screen/02-CONTEXT.md` — Timeline grid layout, CSS Modules pattern, design tokens, DayCell states, NowMarker.
- `.planning/phases/03-plant-creation-and-photos/03-CONTEXT.md` — Photo upload, PlantRow photo rendering, Toast pattern, immediate refresh after creation.

### Key Source Files
- `packages/shared/src/types.ts` — `PlantResponse`, `PlantScheduleSummary` with `isOverdue`, `overdueSince`, `futureWateringDates`.
- `packages/shared/src/recurrence.ts` — `buildScheduleSummary` computes overdue state and future dates from watering events.
- `apps/server/src/routes/plants.ts` — `POST /api/plants/:id/waterings` endpoint already exists (line 152).
- `apps/server/src/services/plants.ts` — `plantService.recordWatering` implementation.
- `apps/server/src/db/queries.ts` — `recordWatering` inserts a watering event, `listWateringEvents` retrieves them.
- `apps/web/src/components/DayCell/DayCell.tsx` — DayCell with `overdue` state and CSS styling.
- `apps/web/src/components/DayCell/DayCell.module.css` — `.overdue` style with yellow background and dot.
- `apps/web/src/components/PlantRow/PlantRow.tsx` — `getCellState` computes cell state, renders DayCell per date.
- `apps/web/src/hooks/usePlants.ts` — Polling hook with `refresh` function for immediate data update.
- `apps/web/src/lib/api.ts` — API client (needs `confirmWatering` function).
- `apps/web/src/styles/tokens.css` — Design tokens including `--cell-size`, `--dot-size`, `--color-overdue`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/DayCell/DayCell.tsx` — Already renders `overdue` state. Adding `onClick` handler and pointer styling turns it into a tap target.
- `apps/web/src/hooks/usePlants.ts` — `refresh` function already triggers immediate data fetch. Same pattern as plant creation refresh.
- `apps/web/src/lib/api.ts` — Follow the same `fetch` pattern to add `confirmWatering(plantId)`.
- `apps/server/src/routes/plants.ts` — `POST /api/plants/:id/waterings` endpoint is complete and tested.
- `apps/web/src/styles/tokens.css` — CSS custom properties make cell size changes easy (change `--cell-size`, add `--cell-width`/`--cell-height`).

### Established Patterns
- CSS Modules with CSS custom properties for component styling.
- `usePlants` hook provides `refresh` for immediate data update after mutations.
- Plant creation uses the same pattern: API call → immediate refresh → visual update.
- DayCell uses state-based CSS classes (`future`, `overdue`, `today`).
- PlantRow computes cell state via pure function `getCellState`.

### Integration Points
- `DayCell` needs an `onClick` prop (optional, only passed when `state === 'overdue'`).
- `PlantRow` needs `onConfirmWatering` callback to pass down to overdue DayCells.
- `Timeline` needs to receive `onConfirmWatering` and wire it to the API call + refresh.
- `api.ts` needs `confirmWatering(plantId)` calling `POST /api/plants/:id/waterings`.
- Server host binding needs to change from localhost to `0.0.0.0` for LAN access.
- `index.html` viewport meta tag needs `user-scalable=no, maximum-scale=1`.

</code_context>

<specifics>
## Specific Ideas

- The tap interaction should feel immediate and obvious — the yellow cell is a natural call to action on a tablet screen.
- Rectangular cells (wider than tall) better match the horizontal scrolling timeline layout and give a larger horizontal tap target.
- The yellow→green transition gives visual confirmation without disrupting the glanceable nature of the timeline.
- Kiosk mode means no accidental zoom, no need to re-navigate to the app — just glance and tap.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-watering-confirmation-and-tablet-polish*
*Context gathered: 2026-05-03*
