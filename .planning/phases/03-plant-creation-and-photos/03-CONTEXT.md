# Phase 3: Plant Creation and Photos - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Let the user add household plants with name, photo, and day-based watering recurrence. After creation, the plant appears as a new row in the timeline and persists after refresh/restart. This phase builds the add-plant modal, file upload endpoint, photo storage on disk, and wires the creation flow into the existing timeline.

This phase does NOT include editing/deleting plants (v2), the tap-to-confirm watering interaction (Phase 4), or account/notification features.

</domain>

<decisions>
## Implementation Decisions

### Add-Plant Form
- **D-01:** The add-plant form opens as a centered modal over the timeline — no navigation to a separate page.
- **D-02:** A fixed "+" button is always visible on the timeline (e.g., top-right corner) to trigger the modal, regardless of whether plants already exist.
- **D-03:** The EmptyState component can also trigger the modal as a secondary entry point, but the fixed "+" button is the primary trigger.
- **D-04:** The form has 3 fields in this order: plant name (required text input), photo (optional file selector with preview), recurrence interval (required, defaults to 7 days).
- **D-05:** The `lastWateredOn` field is not exposed to the user — it defaults to today via the existing server behavior.

### Photo Upload
- **D-06:** The user selects a photo via standard file picker (input[type=file]). No camera capture in v1.
- **D-07:** The selected photo shows a preview in the modal before submission.
- **D-08:** Photo files are stored on disk (server-side) and the file path is saved in `plants.photo_path` in SQLite.
- **D-09:** The server needs a new multipart upload endpoint or the existing `POST /api/plants` must accept multipart form data.

### Recurrence Input
- **D-10:** The recurrence field presents quick-select presets (3 days, 7 days, 14 days) alongside a custom numeric input for arbitrary intervals.
- **D-11:** The default selection is 7 days (most common for house plants).

### Feedback After Creation
- **D-12:** After successful creation, the modal closes and a discreet toast notification confirms the plant was added.
- **D-13:** The plant list refreshes immediately (bypass the 60s polling) so the new row appears instantly.
- **D-14:** The new plant's photo replaces the placeholder `<Flower2>` icon on its timeline row.

### Claude's Discretion
- Exact modal styling and dimensions (should use existing design tokens).
- Toast component implementation and position.
- File size limits and accepted image formats.
- Photo storage directory path and file naming convention.
- Error states for the form (network failure, invalid file, server error).
- How the "+" button integrates into the existing Timeline layout.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Scope
- `.planning/PROJECT.md` — Product intent, core value, constraints (photo upload, plant creation creates new row), and out-of-scope boundaries.
- `.planning/REQUIREMENTS.md` — Phase 3 requirement mapping: PLNT-01, PLNT-02, PLNT-03, PLNT-04, PERS-03.
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, and notes (store photos on disk, enforce upload limits, safe filenames).

### Prior Phase Context
- `.planning/phases/01-server-and-domain-foundation/01-CONTEXT.md` — API shape decisions, `POST /api/plants` contract, recurrence semantics, `lastWateredOn` defaults.
- `.planning/phases/02-timeline-main-screen/02-CONTEXT.md` — Timeline grid layout, CSS Modules pattern, design tokens, `PlantRow` with placeholder icon, `usePlants` polling.

### Key Source Files
- `packages/shared/src/types.ts` — `PlantResponse` type with `photoPath: string | null`.
- `apps/server/src/db/schema.ts` — SQLite schema with `photoPath` column already present.
- `apps/server/src/routes/plants.ts` — Existing `POST /api/plants` with Zod schema accepting `photoPath`.
- `apps/web/src/components/Timeline/Timeline.tsx` — Timeline grid, scroll-to-today behavior.
- `apps/web/src/components/PlantRow/PlantRow.tsx` — Row with `<Flower2>` placeholder icon to replace.
- `apps/web/src/components/EmptyState/EmptyState.tsx` — Empty state with "Add your first plant" message.
- `apps/web/src/hooks/usePlants.ts` — Polling hook that needs an immediate refresh trigger.
- `apps/web/src/lib/api.ts` — Existing API client (needs `createPlant` with multipart).
- `apps/web/src/styles/tokens.css` — Design tokens and CSS custom properties.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/EmptyState/EmptyState.tsx` — Can serve as secondary trigger for the add-plant modal.
- `apps/web/src/styles/tokens.css` — Design tokens for spacing, colors, typography, and grid dimensions.
- `apps/web/src/lib/api.ts` — Existing API client pattern with `fetch`.
- `apps/server/src/routes/plants.ts` — `POST /api/plants` route already exists with Zod validation.
- `packages/shared/src/types.ts` — `PlantResponse` already has `photoPath: string | null`.

### Established Patterns
- CSS Modules for component styling (`.module.css` files).
- CSS custom properties for design tokens (`var(--space-md)`, `var(--color-accent)`, etc.).
- `usePlants` hook with 60s polling and mock data fallback.
- Zod schemas for API validation on the server.
- Monorepo structure: `apps/server`, `apps/web`, `packages/shared`.
- lucide-react icons for UI elements.

### Integration Points
- `POST /api/plants` needs to accept multipart form data (currently JSON body with `photoPath` string — needs new upload endpoint or multipart support).
- New server endpoint needed for serving stored photo files (static file serving or dedicated route).
- `usePlants` hook needs a way to trigger immediate refresh after plant creation.
- `PlantRow.iconPlaceholder` should render the plant photo when `photoPath` is not null instead of the `<Flower2>` icon.
- The "+" button needs a fixed position in the Timeline viewport layout.

</code_context>

<specifics>
## Specific Ideas

- The modal should feel lightweight — quick to open, fill in, and close. No multi-step wizard.
- Presets (3j/7j/14j) make the most common cases one-tap, while the custom input handles exceptions.
- The toast should be discreet and auto-dismiss — consistent with the "glance at the tablet" household use case.
- Photo preview in the form gives confidence before submission.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-plant-creation-and-photos*
*Context gathered: 2026-05-03*
