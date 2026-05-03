# Phase 4: Watering Confirmation and Tablet Polish - Research

**Researched:** 2026-05-03
**Domain:** React client interaction, CSS tablet polish, LAN server access, persistence verification
**Confidence:** HIGH

## Summary

Phase 4 closes the core user loop: tap the yellow overdue cell to confirm watering, watch it turn green, and see future cells recalculate. The backend endpoint `POST /api/plants/:id/waterings` is fully implemented and tested. The DayCell already renders an `overdue` state with yellow styling. The missing pieces are (1) wiring a click handler from Timeline down through PlantRow to DayCell, (2) adding `confirmWatering` to the API client, (3) changing cell dimensions from square to slightly rectangular for better tablet tap targets, (4) adding a CSS transition on the color change, (5) adding viewport meta tags to disable zoom on tablet, (6) configuring Vite dev server host for LAN access, and (7) running persistence verification tests.

The server already binds to `0.0.0.0` by default (`apps/server/src/config.ts`). The Vite dev server needs `server.host: true` or `server.host: '0.0.0.0'` added. The `index.html` viewport meta tag currently has `user-scalable` unspecified. No new server endpoints are needed.

**Primary recommendation:** This phase is predominantly client-side wiring plus configuration changes. The server work is minimal (already done). Plan two waves: (1) tap-to-confirm interaction with API client and cell styling, (2) tablet kiosk configuration and persistence verification.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** The user confirms watering by tapping directly on the yellow overdue cell in the timeline. No separate button or icon.
- **D-02:** Only the overdue cell is tappable. Green future cells and empty cells have no tap interaction.
- **D-03:** The confirmation calls `POST /api/plants/:id/waterings` (already exists on the server).
- **D-04:** Cells should be slightly rectangular -- wider than tall -- for better tap targets on tablet. Current `--cell-size: 48px` square becomes a wider rectangle (width > height). Row height and layout must adapt accordingly.
- **D-05:** When the user taps the overdue cell, it transitions smoothly from yellow to green (0.2-0.3s). No toast notification -- the visual change is sufficient feedback.
- **D-06:** After the POST succeeds, the timeline refreshes immediately via `usePlants.refresh()` to show recalculated green cells.
- **D-07:** The app is designed for permanent kiosk use -- the tablet stays on, displaying the timeline continuously.
- **D-08:** Disable zoom/pinch on tablet via viewport meta tag (`user-scalable=no, maximum-scale=1`).
- **D-09:** The server listens on `0.0.0.0` so the tablet can access it via `http://LOCAL_IP:PORT` on the home network.
- **D-10:** Phase 4 includes verification tests (manual and/or automated) that plants, watering events, and photos survive server restart, browser refresh, and LAN access. No new persistence features -- just validation of what Phases 1-3 built.

### Claude's Discretion
- Exact rectangular cell dimensions (width vs height).
- How the tap handler is wired into DayCell (callback prop, click handler, pointer events).
- Transition animation details (CSS transition on background-color and dot color).
- How the server host/port is configured for LAN access.
- Testing approach for persistence verification (automated test script vs manual checklist).
- Whether to add a cursor:pointer or tap highlight on overdue cells.

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WATR-01 | User sees one yellow overdue alert on a plant row when that plant is late for watering. | DayCell already renders `overdue` state. `getCellState` in PlantRow computes overdue cells from `schedule.isOverdue` and `schedule.overdueSince`. Already functional -- verification only. |
| WATR-02 | User can tap the yellow overdue alert to mark the plant as watered. | Add `onClick` prop to DayCell, pass callback from PlantRow/Timeline. API client needs `confirmWatering(plantId)` calling `POST /api/plants/:id/waterings`. |
| WATR-03 | After watering is confirmed, the overdue alert disappears and the plant schedule recalculates from the confirmation. | Server `recordWatering` already recalculates from actual `wateredOn` date (confirmed by existing tests). Client calls `usePlants.refresh()` after POST to update timeline. |
| WATR-04 | Multiple missed recurrence intervals still produce only one overdue alert per plant. | Server returns single `isOverdue` boolean and single `overdueSince` date. `getCellState` spans overdue from `overdueSince` to `today` as one contiguous range. Already correct. |
| SERV-01 | The app runs through a local server reachable from a tablet on the home network. | Server already binds `0.0.0.0` in config.ts. Vite dev server needs `host: true` for LAN access. Production build serves from Fastify static plugin. |
| TIME-05 | Timeline layout remains readable and aligned on a tablet viewport. | Change cell dimensions to rectangular (wider than tall), add touch-appropriate tap targets (minimum 44px), disable zoom via viewport meta. |
| PERS-01 | Plants remain available after browser refresh. | Server-side state in SQLite. Client refetches on load via `usePlants`. Already works. Verification needed. |
| PERS-02 | Plants and watering history remain available after server restart. | SQLite persistence. Existing route test `returns persisted plant data after reopening the database` validates this. Verification needed. |
| PERS-03 | Plant photos remain available after browser refresh and server restart. | Photos stored on disk via `@fastify/static`. Already serves at `/photos/{filename}`. Verification needed. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version (installed) | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^19.1.0 | UI rendering | Established in Phase 2 |
| vite | ^6.3.5 | Dev server and bundler | Established in Phase 2 |
| fastify | ^5.6.1 | Server framework | Established in Phase 1 |
| better-sqlite3 | ^12.2.0 | SQLite driver | Established in Phase 1 |
| lucide-react | ^0.511.0 | Icons | Established in Phase 3 |
| date-fns | ^4.1.0 | Date math | Established in Phase 1 |
| vitest | ^4.0.6 | Testing | Established in Phase 1 |

### No New Dependencies
Phase 4 requires zero new packages. Every capability needed already exists in the project:
- CSS transitions: native CSS `transition` property
- Viewport meta: plain HTML
- Tap handling: native React `onClick` / `onPointerDown`
- LAN access: existing server config + Vite config change

## Architecture Patterns

### Recommended Project Structure (No Changes Needed)
```
apps/web/src/
├── components/
│   ├── DayCell/           # Add onClick prop, pointer styles, transition
│   ├── PlantRow/          # Thread onConfirmWatering callback
│   ├── Timeline/          # Wire confirmation handler with API call
│   └── ...                # Other components unchanged
├── hooks/
│   └── usePlants.ts       # Already has refresh() -- no changes needed
├── lib/
│   └── api.ts             # Add confirmWatering function
└── styles/
    └── tokens.css         # Update cell dimensions
apps/server/src/
├── config.ts              # Already defaults to 0.0.0.0 -- no change
└── (all other files)      # No server changes needed
apps/web/
├── index.html             # Update viewport meta tag
└── vite.config.ts         # Add server.host for LAN access
```

### Pattern 1: Callback Prop Chain for Cell Interaction
**What:** Pass an `onConfirmWatering(plantId: string)` callback from Timeline to PlantRow to DayCell.
**When to use:** For any cell-level interaction that needs plant context.
**Example:**
```typescript
// Timeline.tsx -- owns the API call + refresh
const handleConfirmWatering = useCallback(async (plantId: string) => {
  await confirmWatering(plantId);
  await refresh();
}, [refresh]);

// Pass down:
<PlantRow onConfirmWatering={handleConfirmWatering} ... />

// PlantRow.tsx -- passes plantId closure
<DayCell
  onClick={state === 'overdue' ? () => onConfirmWatering(plant.id) : undefined}
  ...
/>

// DayCell.tsx -- renders pointer and handles tap
<div
  className={classNames}
  onClick={onClick}
  role={onClick ? 'button' : undefined}
  tabIndex={onClick ? 0 : undefined}
/>
```

### Pattern 2: CSS Custom Property for Cell Dimensions
**What:** Replace `--cell-size` (single dimension) with `--cell-width` and `--cell-height` for rectangular cells.
**When to use:** For tablet-optimized tap targets.
**Example:**
```css
/* tokens.css -- before */
--cell-size: 48px;

/* tokens.css -- after */
--cell-width: 56px;
--cell-height: 40px;

/* DayCell.module.css */
.cell {
  width: var(--cell-width);
  height: var(--cell-height);
  /* ... rest unchanged */
}
```
**Impact on grid:** Timeline grid template uses `var(--cell-size)` for column sizing. Must change to `var(--cell-width)`. NowMarker uses `CELL_SIZE` constant (48) for positioning math -- must update to use the new width value.

### Pattern 3: CSS Transition for Visual Feedback
**What:** Add `transition: background-color 0.25s ease, color 0.25s ease` to DayCell.
**When to use:** For the yellow-to-green confirmation feedback.
**Important:** The transition only works visually if the DOM element persists through the state change. Since DayCell uses `key={date}` and the cell stays in the same position, the CSS transition will fire naturally when the class changes from `.overdue` to `.future`.

**Caveat:** The `refresh()` call replaces the entire plants array, which causes React to re-render PlantRow with new props. The DayCell with `key={date}` is the same key, so React updates the existing DOM node (not unmount/remount). The CSS transition will work correctly.

### Anti-Patterns to Avoid
- **Toast on watering confirmation:** D-05 explicitly says no toast. The yellow-to-green transition IS the feedback.
- **Making non-overdue cells tappable:** D-02 says only overdue cells are tappable. Future and empty cells have no interaction.
- **Using `onTouchStart` instead of `onClick`:** Modern mobile browsers handle `onClick` with a minimal delay. React's synthetic events handle this correctly. Adding touch-specific handlers introduces complexity with no benefit.
- **Separating cell width/height with `--cell-size` still present:** Remove the old `--cell-size` token to prevent confusion. Replace all references.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tap feedback | Custom tap ripple animation | CSS `transition` on `background-color` | D-05 specifies simple 0.2-0.3s color transition. No ripple needed. |
| Touch event handling | Custom touch event system | React `onClick` + `cursor: pointer` | React handles touch-to-click synthesis. Adding touch-specific code is unnecessary complexity. |
| Schedule recalculation | Client-side date math after watering | Server `POST /api/plants/:id/waterings` returns updated schedule | Server already recalculates `nextDueDate`, `isOverdue`, `futureWateringDates` after each watering event. Client just calls `refresh()`. |
| LAN discovery | mDNS/ZeroConf service broadcasting | User enters `http://LOCAL_IP:3000` directly | Kiosk tablet is configured once. No discovery protocol needed. |
| Optimistic updates | Client-side schedule prediction | `await POST; await refresh()` pattern | The refresh is fast (local server, local SQLite). Optimistic update adds complexity for negligible UX gain. |

**Key insight:** The server already handles all the business logic for watering confirmation. The client's job is purely: detect tap, call API, refresh display. No client-side state management for watering logic.

## Common Pitfalls

### Pitfall 1: NowMarker Position Breaks After Cell Resize
**What goes wrong:** NowMarker uses hardcoded `CELL_SIZE = 48` constant in Timeline.tsx for positioning math. If cells become 56px wide, the marker drifts.
**Why it happens:** The constant is duplicated in Timeline.tsx instead of reading from CSS custom properties.
**How to avoid:** Update the `CELL_SIZE` constant in Timeline.tsx to match the new `--cell-width` value. Or better, read the computed cell width at runtime with `getComputedStyle`.
**Warning signs:** NowMarker no longer aligns with the day column after resize.

### Pitfall 2: Grid Template Column Mismatch
**What goes wrong:** Timeline.tsx constructs `gridTemplateColumns` using `var(--cell-size)`. After renaming to `--cell-width`, old references break layout.
**Why it happens:** The token name is used in two places: CSS and inline style string.
**How to avoid:** Update the inline `gridTemplateColumns` string in Timeline.tsx to use `var(--cell-width)`. Search for all references to `--cell-size`.
**Warning signs:** Grid columns collapse or expand unexpectedly.

### Pitfall 3: DayCell Key Stability During Refresh
**What goes wrong:** If DayCell keys change between renders, React unmounts and remounts the element, causing the CSS transition to not fire.
**Why it happens:** Keys must be stable across data refreshes.
**How to avoid:** Current code uses `key={date}` which is stable. Do not change to `key={date + state}` or similar. The date is the stable identity of a cell.
**Warning signs:** The yellow-to-green transition appears as an instant snap instead of a smooth animation.

### Pitfall 4: Vite Dev Server Not Accessible on LAN
**What goes wrong:** Tablet cannot reach the dev server even though the Fastify server binds to `0.0.0.0`.
**Why it happens:** Vite dev server defaults to `localhost` only. The `vite.config.ts` does not set `server.host`.
**How to avoid:** Add `server: { host: true }` (or `host: '0.0.0.0'`) to the Vite config. Vite will print the LAN IP on startup.
**Warning signs:** `curl http://192.168.x.x:5173` from another device times out.

### Pitfall 5: Viewport Meta Tag Incomplete
**What goes wrong:** Pinch-to-zoom still works on iPad despite adding `user-scalable=no`.
**Why it happens:** Some iOS versions require `maximum-scale=1` in addition to `user-scalable=no`. The meta tag must include both.
**How to avoid:** Set viewport to `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />`.
**Warning signs:** Users can pinch-zoom the timeline on tablet.

### Pitfall 6: Row Height Does Not Adapt to Taller Cells
**What goes wrong:** Increasing cell width without adjusting `--row-height` causes visual misalignment.
**Why it happens:** `--row-height: 64px` was designed for 48px square cells. With shorter rectangular cells (e.g., 40px height), the row may feel too tall; with wider cells, the name column alignment might look off.
**How to avoid:** Keep `--row-height` at 64px for now (it still provides ample padding for 40px tall cells). Verify visually on tablet.
**Warning signs:** Cells float inside oversized rows, or rows clip cell content.

## Code Examples

### confirmWatering API Client Function
```typescript
// apps/web/src/lib/api.ts -- add after createPlant
export async function confirmWatering(plantId: string): Promise<PlantResponse> {
  const { from, to } = getDateWindow();
  const res = await fetch(`${API_BASE}/plants/${plantId}/waterings?from=${from}&to=${to}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error('Could not confirm watering');
  return res.json();
}
```
Note: The POST body can be empty `{}` because the server defaults `wateredOn` to today via `input.wateredOn ?? currentDay()`. The query params `from`/`to` are required so the response includes the updated schedule summary.

### DayCell with Tap Interaction
```typescript
// apps/web/src/components/DayCell/DayCell.tsx
import styles from './DayCell.module.css';

interface DayCellProps {
  state: 'empty' | 'future' | 'overdue';
  isToday: boolean;
  date?: string;
  onClick?: () => void;  // Only passed for overdue cells
}

export function DayCell({ state, isToday, date, onClick }: DayCellProps) {
  const classNames = [
    styles.cell,
    isToday ? styles.today : '',
    state === 'future' ? styles.future : '',
    state === 'overdue' ? styles.overdue : '',
    onClick ? styles.clickable : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      {...(date ? { 'data-date': date } : {})}
      {...(onClick ? {
        onClick,
        role: 'button',
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') onClick();
        },
      } : {})}
    >
      {(state === 'future' || state === 'overdue') && (
        <div className={styles.dot} />
      )}
    </div>
  );
}
```

### DayCell.module.css Updates
```css
.cell {
  width: var(--cell-width);
  height: var(--cell-height);
  border-radius: var(--cell-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: background-color 0.25s ease;
}

.clickable {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;  /* Prevent tap flash on iOS */
}

.clickable:active {
  opacity: 0.85;
  transform: scale(0.95);
  transition: transform 0.1s ease, opacity 0.1s ease;
}

/* ...rest of styles unchanged... */
```

### tokens.css Dimension Changes
```css
/* Replace: */
--cell-size: 48px;

/* With: */
--cell-width: 56px;
--cell-height: 40px;
```

### Vite Config for LAN Access
```typescript
// apps/web/vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Listen on 0.0.0.0, print LAN IP
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/photos': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
```

### index.html Viewport Update
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `--cell-size` single dimension | `--cell-width` + `--cell-height` for rectangular cells | This phase | Tablet tap targets wider, more ergonomic |
| `localhost` server binding | `0.0.0.0` default (already in place) | Phase 1 | LAN access works out of the box |
| No touch optimization | `-webkit-tap-highlight-color: transparent` + `cursor: pointer` | This phase | Clean tap experience on mobile/tablet |

**No deprecated patterns identified.** The existing codebase uses modern patterns throughout.

## Open Questions

1. **Exact cell dimensions**
   - What we know: Must be wider than tall (D-04). Current square is 48px.
   - What's unclear: Exact width and height values.
   - Recommendation: 56px wide x 40px tall. This gives a 56px horizontal tap target (exceeds Apple's 44px minimum) while keeping cells compact vertically. Row height stays at 64px (12px padding top+bottom).

2. **Accessibility for overdue cell tap**
   - What we know: D-01 says tap the yellow cell. D-02 says only overdue cells are tappable.
   - What's unclear: Whether keyboard accessibility (Enter/Space to confirm) matters for a kiosk tablet app.
   - Recommendation: Add `role="button"`, `tabIndex={0}`, and `onKeyDown` for Enter/Space. Low cost, prevents accessibility regression if someone tests with keyboard.

3. **Production build serving for LAN**
   - What we know: Vite dev server works for development LAN access. The Fastify server serves static files from `data/photos` but not the built web app.
   - What's unclear: Whether the production deployment model is "Vite dev server on LAN" or "Fastify serves built SPA + API".
   - Recommendation: For v1 kiosk use, the Vite dev server with proxy is sufficient. A production build step can be added later. Document both approaches in the README.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build and dev server | Yes | 25.1.0 | -- |
| npm | Package management | Yes | 11.6.2 | -- |
| SQLite | Data persistence | Yes | 3.51.0 | -- |
| tsx | Server dev runner | Yes | (via npx) | -- |
| Vite | Web dev server | Yes | ^6.3.5 | -- |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None.

## Existing Test Infrastructure

### Server Tests (vitest)
- `apps/server/src/test/plants.routes.test.ts` -- comprehensive route tests including watering confirmation, persistence after DB reopen, multipart upload
- `apps/server/src/db/queries.test.ts` -- query layer tests
- `apps/server/src/services/plants.test.ts` -- service layer tests

### Client Tests
- No client-side tests exist yet. The client is purely UI components with no extracted business logic that warrants unit testing.

### Verification for PERS-01/02/03
- The existing route test `returns persisted plant data after reopening the database` validates PERS-02 (server restart).
- PERS-01 (browser refresh) is validated by the architecture: client refetches from server on mount.
- PERS-03 (photo persistence) is validated by the multipart photo upload + static serving test.
- D-10 asks for explicit verification. A manual checklist or a smoke test script that exercises the full flow is sufficient.

## Sources

### Primary (HIGH confidence)
- Full source code audit of `apps/web/src/`, `apps/server/src/`, `packages/shared/src/` -- all files read and analyzed directly.
- `apps/server/src/config.ts` -- confirmed `0.0.0.0` default host binding.
- `apps/server/src/routes/plants.ts` line 152 -- confirmed `POST /api/plants/:id/waterings` endpoint exists and is complete.
- `apps/server/src/test/plants.routes.test.ts` -- confirmed existing test coverage for watering confirmation and persistence.

### Secondary (MEDIUM confidence)
- Apple Human Interface Guidelines for minimum tap target size (44px) -- standard mobile/tablet convention.

### Tertiary (LOW confidence)
- None needed for this phase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies. All libraries already in use and verified.
- Architecture: HIGH -- callback prop chain pattern established in Phase 3 (AddPlantModal). Cell resize is CSS custom property change. LAN access is config change.
- Pitfalls: HIGH -- all pitfalls identified from direct code audit, not speculation.

**Research date:** 2026-05-03
**Valid until:** 2026-06-03 (stable codebase, no fast-moving dependencies)
