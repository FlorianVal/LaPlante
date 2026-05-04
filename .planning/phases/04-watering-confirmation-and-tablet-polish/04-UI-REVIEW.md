# Phase 4 -- UI Review

**Audited:** 2026-05-03
**Baseline:** 04-UI-SPEC.md (approved design contract)
**Screenshots:** Captured (desktop 1440x900, mobile 375x812, tablet 1024x768)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | All declared copy matches implementation exactly; no generic labels |
| 2. Visuals | 4/4 | Clear focal point on overdue cells; accessibility wired correctly; tap targets meet 44px minimum |
| 3. Color | 3/4 | Token system used throughout; 3 hardcoded `#ef4444` instances in AddPlantModal violate token convention |
| 4. Typography | 4/4 | Only declared sizes and weights used via CSS custom properties |
| 5. Spacing | 4/4 | All spacing uses declared scale tokens; no arbitrary pixel values in components |
| 6. Experience Design | 4/4 | Loading, error, empty, and confirmation states all handled; keyboard accessibility present |

**Overall: 23/24**

---

## Top 3 Priority Fixes

1. **Hardcoded error color `#ef4444` in AddPlantModal CSS** -- Prevents theme consistency and violates token convention. Three locations: `.inputError` (line 83), `.errorText` (line 88), `.formError` (line 183) in `AddPlantModal.module.css`. Fix: add `--color-error: #ef4444` to `tokens.css` and reference it via `var(--color-error)`.

2. **Toast always shows Check icon regardless of message type** -- The error toast for failed watering confirmation displays a green checkmark, which is semantically incorrect. Fix: add a `type` prop to Toast (`'success' | 'error'`), render `Check` for success and `AlertTriangle` (or `X`) for error, and pass `type="error"` from `handleConfirmWatering`.

3. **FAB uses hardcoded `rgba` values for box-shadow** -- `App.module.css` lines 22 and 28 use `rgba(34, 197, 94, 0.3)` and `rgba(34, 197, 94, 0.4)`. These are accent-color-derived but not tokenized. Fix: use CSS custom property `--color-accent-shadow` or accept as minor since box-shadow rgba cannot be expressed purely via CSS custom properties without `color-mix()` support.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

All copy matches the UI-SPEC.md contract:

| Element | Expected | Actual | Match |
|---------|----------|--------|-------|
| Watering error toast | "Could not record watering. Please try again." | `Timeline.tsx:76` -- exact match | Yes |
| Empty state heading | "No plants yet" | `EmptyState.tsx:12` -- exact match | Yes |
| Empty state body | "Add your first plant to see the watering timeline." | `EmptyState.tsx:13` -- exact match | Yes |
| Error state body | "Check that the server is running and try again." | `ErrorState.tsx:14` -- exact match | Yes |
| Error state CTA | "Try again" | `ErrorState.tsx:16` -- acceptable (not generic "OK" or "Submit") | Yes |
| aria-label on overdue cell | "Water {plantName}" | `DayCell.tsx:29` -- `Water ${plantName}` | Yes |

No generic labels ("Submit", "Click Here", "OK") found in phase 4 scope. The "Cancel" button in `AddPlantModal.tsx:221` is contextually appropriate (modal dismissal), not a generic form action.

### Pillar 2: Visuals (4/4)

- **Clear focal point:** Overdue cells render with amber background and amber dot, creating high visual contrast against white/green timeline. The cursor:pointer and active scale (0.92) reinforce interactivity.
- **Tap targets:** Rectangular cells are 56px wide x 48px tall, exceeding Apple HIG 44px minimum on both axes. Preset buttons and the FAB are 44px tall (`AddPlantModal.module.css:160`, `App.module.css:8-9`).
- **Accessibility:** `role="button"`, `tabIndex={0}`, `aria-label` with plant name, and keyboard handler (Enter + Space) all present on clickable overdue cells (`DayCell.tsx:26-38`).
- **Icon-only FAB** has `aria-label="Add plant"` (`App.tsx:43`).
- **Visual hierarchy:** Size differentiation exists -- overdue dot (20px via `--dot-size`) in a 56x48 cell. Color differentiation through three distinct cell states (empty=transparent, future=green, overdue=amber).

### Pillar 3: Color (3/4)

The token system in `tokens.css` defines all semantic colors and is used correctly throughout phase 4 components:

- `--color-accent` (#22c55e) used for: future cell dots, FAB background, submit button, empty state action text, preset active state.
- `--color-overdue` (#f59e0b) used for: overdue cell dot, error state icon.
- `--color-bg-primary` and `--color-bg-secondary` used for all backgrounds.
- No `text-primary`/`bg-primary` Tailwind patterns (project uses CSS Modules, not Tailwind).

**Issue -- hardcoded `#ef4444` (3 instances):**
- `AddPlantModal.module.css:83` -- `.inputError { border-color: #ef4444; }`
- `AddPlantModal.module.css:88` -- `.errorText { color: #ef4444; }`
- `AddPlantModal.module.css:183` -- `.formError { color: #ef4444; }`

These predate phase 4 (from phase 3) but are part of the audited UI surface. The color is not declared in `tokens.css` and is not used elsewhere. This is a consistency gap, not a functional issue.

**Issue -- hardcoded rgba in FAB box-shadow (2 instances):**
- `App.module.css:22` -- `box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);`
- `App.module.css:28` -- `box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);`

These use the accent color (#22c55e = rgb(34, 197, 94)) in rgba form. This also predates phase 4 but affects the overall color system.

### Pillar 4: Typography (4/4)

All typography uses CSS custom properties from `tokens.css`:

**Font sizes in use (via `var()` references):**
- `--font-body` (16px): plant names, inputs, submit button, toast, error state body, day of month
- `--font-label` (12px): field labels, photo hint, day of week, today label
- `--font-heading` (20px): empty state heading, error state heading, modal title

**Font weights in use:**
- `--font-weight-regular` (400): body text
- `--font-weight-semibold` (600): headings, active presets, labels

No inline font-size or font-weight values found. No Tailwind font classes (project uses CSS Modules). Exactly 3 sizes and 2 weights match the UI-SPEC declaration.

### Pillar 5: Spacing (4/4)

All spacing uses the declared scale from `tokens.css`:

| Token | Value | Observed usage |
|-------|-------|----------------|
| --space-xs (4px) | 4px | Icon gaps, border-radius, field gaps, close button padding |
| --space-sm (8px) | 8px | Inner gaps, toast padding, row gaps, input padding |
| --space-md (16px) | 16px | Section gaps, name column padding, toast gap, form gaps |
| --space-lg (24px) | 24px | Modal padding, photo area padding, section breaks |
| --space-xl (32px) | 32px | Page padding, toast bottom offset, submit button padding |
| --space-2xl (48px) | 48px | Toast border-radius |

No arbitrary `px` or `rem` values in bracket notation found in any TSX/JSX file. The grid dimension tokens (`--cell-width`, `--cell-height`, `--row-height`, etc.) are correctly migrated from the old `--cell-size` to the new rectangular dimensions per the UI-SPEC.

### Pillar 6: Experience Design (4/4)

**State coverage:**

| State | Component | Status |
|-------|-----------|--------|
| Loading | LoadingSkeleton | Present -- pulsing skeleton cells |
| Error (initial) | ErrorState | Present with retry button |
| Error (mutation) | Toast | Present -- "Could not record watering. Please try again." |
| Empty | EmptyState | Present with clickable CTA |
| Success (mutation) | Visual transition | Present -- yellow-to-green 0.25s ease, no toast (per spec) |
| Disabled | Submit button | Present -- opacity 0.5 when name is empty or submitting |
| Confirmation (destructive) | Not applicable | Phase 4 has no destructive actions |

**Interaction patterns verified:**
- Watering confirmation: tap overdue cell -> POST -> refresh -> visual update (`Timeline.tsx:71-78`)
- Error recovery: toast auto-dismisses after 3 seconds (`Toast.tsx:23`)
- Retry: ErrorState has "Try again" button calling `retry` (`ErrorState.tsx:16`)
- Polling: 60-second interval keeps timeline fresh in kiosk mode (`usePlants.ts:44-54`)
- Midnight crossover: detects date change and sets loading state (`usePlants.ts:47-49`)
- Keyboard accessibility: Enter and Space trigger watering confirmation (`DayCell.tsx:31-34`)
- Modal dismissal: Escape key closes AddPlantModal (`AddPlantModal.tsx:40`)

**Viewport meta verified:** `index.html:5` contains `user-scalable=no, maximum-scale=1.0` as specified in UI-SPEC.

---

## Files Audited

- `apps/web/src/components/DayCell/DayCell.tsx`
- `apps/web/src/components/DayCell/DayCell.module.css`
- `apps/web/src/components/PlantRow/PlantRow.tsx`
- `apps/web/src/components/PlantRow/PlantRow.module.css`
- `apps/web/src/components/Timeline/Timeline.tsx`
- `apps/web/src/components/Timeline/Timeline.module.css`
- `apps/web/src/components/EmptyState/EmptyState.tsx`
- `apps/web/src/components/EmptyState/EmptyState.module.css`
- `apps/web/src/components/ErrorState/ErrorState.tsx`
- `apps/web/src/components/ErrorState/ErrorState.module.css`
- `apps/web/src/components/Toast/Toast.tsx`
- `apps/web/src/components/Toast/Toast.module.css`
- `apps/web/src/components/AddPlantModal/AddPlantModal.tsx`
- `apps/web/src/components/AddPlantModal/AddPlantModal.module.css`
- `apps/web/src/components/DateHeader/DateHeader.module.css`
- `apps/web/src/components/LoadingSkeleton/LoadingSkeleton.module.css`
- `apps/web/src/components/NowMarker/NowMarker.module.css`
- `apps/web/src/App.tsx`
- `apps/web/src/App.module.css`
- `apps/web/src/lib/api.ts`
- `apps/web/src/hooks/usePlants.ts`
- `apps/web/src/styles/tokens.css`
- `apps/web/index.html`
