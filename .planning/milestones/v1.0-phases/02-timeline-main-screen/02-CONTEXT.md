# Phase 2: Timeline Main Screen - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the tablet-first watering timeline as the primary screen of LaPlante. This phase creates the React/Vite web app, renders one row per plant with day-based cells, shows a centered current-date/time marker, and displays future watering dates as green filled cells and overdue states as yellow filled cells. The timeline uses mock/placeholder plant data if Phase 3 is not complete.

This phase does NOT include plant creation UI, photo upload, the tap-to-confirm watering interaction (Phase 4), or account/notification features.

</domain>

<decisions>
## Implementation Decisions

### Grid and Temporal Navigation
- **D-01:** The visible timeline shows approximately 14 days (7 past + 7 future), centered on today.
- **D-02:** The grid is scrollable horizontally — the user can swipe/scroll to see days beyond the default window — but it starts centered on today by default.

### Plant Row Layout
- **D-03:** Each plant row has the plant name and a photo placeholder icon on the left, with day cells extending to the right.
- **D-04:** Until Phase 3 delivers photo upload, the photo area shows a default plant icon placeholder.

### Current-Date Marker
- **D-05:** A thin vertical line spans all plant rows at the current day column position.
- **D-06:** The current time (e.g., "14:30") is displayed at the top of the marker.

### Cell Appearance
- **D-07:** Future watering dates appear as filled cells with a green background.
- **D-08:** Overdue watering dates appear as filled cells with the same style but in yellow/orange. The tap-to-confirm interaction belongs to Phase 4.

### Claude's Discretion
- CSS approach (Tailwind, CSS Modules, plain CSS) — choose based on consistency and speed.
- Empty state when no plants exist — simple message encouraging plant addition.
- Date header row format (day labels at the top of the grid).
- Mock data format — use the existing `PlantResponse` shape from the API.
- Auto-refresh or polling behavior for kiosk-style tablet use.
- Exact green and yellow/orange color values.
- Horizontal scroll behavior (native scroll, snap points, momentum).
- Row height and cell width — stable values tuned for tablet viewport.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Scope
- `.planning/PROJECT.md` — Product intent, core value, constraints, and out-of-scope boundaries.
- `.planning/REQUIREMENTS.md` — Phase 2 requirement mapping: TIME-01 through TIME-05.
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, and notes.

### Research
- `.planning/research/SUMMARY.md` — Recommended stack (React + Vite), architecture approach, and critical pitfalls.
- `.planning/research/ARCHITECTURE.md` — Derived timeline window pattern, data flow, and project structure.
- `.planning/research/STACK.md` — React 19 + Vite 8 setup, supporting libraries, and alternatives.

### Prior Phase
- `.planning/phases/01-server-and-domain-foundation/01-CONTEXT.md` — API shape decisions, schedule summary contract, and recurrence semantics.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/shared/src/types.ts` — `PlantResponse`, `ScheduleWindow`, `PlantScheduleSummary`, `ISODateString` types that the UI consumes directly.
- `packages/shared/src/dates.ts` — `parseISODate`, `formatISODate`, `addCalendarDays`, `compareISODate`, `todayISO` helpers for day-level date math.
- `packages/shared/src/recurrence.ts` — `buildScheduleSummary` returns `nextDueDate`, `isOverdue`, `overdueSince`, `futureWateringDates` — the UI renders these directly.

### Established Patterns
- Monorepo with npm workspaces: `apps/server`, `packages/shared`. The new `apps/web` follows the same pattern.
- Server exposes `GET /api/plants?from=YYYY-MM-DD&to=YYYY-MM-DD` returning `PlantResponse[]` with embedded schedule summaries.
- Zod for validation, date-fns for date arithmetic, Drizzle + SQLite for persistence.
- TypeScript strict mode across all packages.

### Integration Points
- `apps/web` (to be created) calls `GET /api/plants?from=&to=` to fetch plant data with schedule summaries.
- The schedule summary's `futureWateringDates[]` maps directly to green cells; `isOverdue` maps to the yellow cell.
- `photoPath` on `PlantResponse` is nullable — Phase 2 renders a placeholder icon; Phase 3 plugs in the real photo.

</code_context>

<specifics>
## Specific Ideas

- The timeline should feel like a heatmap: at a glance, you see green cells ahead and yellow cells that need attention.
- The current-time marker gives temporal context — you know how far you are into the day.
- Rows should have stable height; cells should have stable width. No layout shift as data changes.
- The default view centers on today with equal past/future context, but the user can explore further by scrolling.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-timeline-main-screen*
*Context gathered: 2026-05-03*
