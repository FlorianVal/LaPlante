# Phase 2: Timeline Main Screen - Research

**Researched:** 2026-05-03
**Domain:** React/Vite tablet timeline UI with CSS grid layout
**Confidence:** HIGH

## Summary

Phase 2 creates the `apps/web` React/Vite application and builds the tablet-first watering timeline as the primary screen. The timeline renders one row per plant with day-based cells, a centered current-time vertical marker, green cells for future watering dates, and amber cells for overdue states. The grid uses fixed cell dimensions (48px square), a sticky plant name column (160px), and native horizontal scrolling centered on today by default.

The API contract is already established: `GET /api/plants?from=YYYY-MM-DD&to=YYYY-MM-DD` returns `PlantResponse[]` with embedded `PlantScheduleSummary` containing `futureWateringDates[]`, `isOverdue`, `overdueSince`, and `nextDueDate`. The shared package (`@laplante/shared`) exports all types and date helpers. Mock data should match the `PlantResponse` shape for use until Phase 3 delivers plant creation.

The CSS architecture uses CSS Modules with CSS custom properties for design tokens -- no Tailwind or external UI framework. Vite provides native CSS Modules support via `.module.css` file naming convention with zero additional configuration. The UI-SPEC (02-UI-SPEC.md) is approved and provides exhaustive layout, color, typography, and spacing specifications.

**Primary recommendation:** Scaffold `apps/web` with Vite + React + TypeScript, use CSS Modules with a tokens.css file for design properties, build the timeline as a CSS grid with `position: sticky` for the left column and top header, and use `scrollIntoView({ inline: 'center' })` to center on today at load time.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** The visible timeline shows approximately 14 days (7 past + 7 future), centered on today.
- **D-02:** The grid is scrollable horizontally -- starts centered on today by default.
- **D-03:** Each plant row has the plant name and a photo placeholder icon on the left, with day cells extending to the right.
- **D-04:** Until Phase 3 delivers photo upload, the photo area shows a default plant icon placeholder.
- **D-05:** A thin vertical line spans all plant rows at the current day column position.
- **D-06:** The current time (e.g., "14:30") is displayed at the top of the marker.
- **D-07:** Future watering dates appear as filled cells with a green background.
- **D-08:** Overdue watering dates appear as filled cells with the same style but in yellow/orange. The tap-to-confirm interaction belongs to Phase 4.

### Claude's Discretion
- CSS approach (Tailwind, CSS Modules, plain CSS) -- choose based on consistency and speed.
- Empty state when no plants exist -- simple message encouraging plant addition.
- Date header row format (day labels at the top of the grid).
- Mock data format -- use the existing `PlantResponse` shape from the API.
- Auto-refresh or polling behavior for kiosk-style tablet use.
- Exact green and yellow/orange color values.
- Horizontal scroll behavior (native scroll, snap points, momentum).
- Row height and cell width -- stable values tuned for tablet viewport.

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TIME-01 | User sees a day-based timeline table as the main screen. | CSS grid layout with day columns, date header row, stable cell dimensions. Vite + React scaffold for `apps/web`. |
| TIME-02 | Each plant is displayed on its own timeline row. | PlantRow component renders plant name (sticky left) + day cells. Maps to `PlantResponse` from API. |
| TIME-03 | The current date/time is represented by a vertical marker centered on the screen. | NowMarker component: 2px blue vertical line + time badge. `scrollIntoView({ inline: 'center' })` on today column at load. |
| TIME-04 | Future watering dates are displayed as small green cells to the right of the current marker. | `PlantScheduleSummary.futureWateringDates[]` drives green cell rendering. DayCell component with state variants. |
| TIME-05 | Timeline layout remains readable and aligned on a tablet viewport. | Fixed 48px cell dimensions, sticky plant name column, overflow-x auto, viewport minimum 768px. UI-SPEC provides complete tablet-tuned specs. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.2.5 | UI framework | Already decided in research; component-based timeline rendering. |
| react-dom | 19.2.5 | React DOM renderer | Peer dependency for React. |
| vite | 8.0.10 | Dev server and build tool | Fast HMR, native CSS Modules, optimized builds. |
| @vitejs/plugin-react | 6.0.1 | Vite React support | Official React plugin with Fast Refresh. |
| typescript | 6.0.3 | Type system | Strict mode across all packages; matches server workspace. |
| date-fns | 4.1.0 | Date formatting for UI | Same library used in shared package; format day headers, day-of-week labels. |
| lucide-react | 1.14.0 | Icons | Plant placeholder icon (Flower2), empty state (Sprout), error (AlertTriangle). |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @laplante/shared | 0.0.0 (workspace) | Shared types and date helpers | Always -- `PlantResponse`, `PlantScheduleSummary`, `parseISODate`, `formatISODate`, `todayISO`, `addCalendarDays`, `compareISODate`, `buildScheduleSummary`. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Modules | Tailwind | Tailwind adds build complexity and utility-class sprawl for what is a focused spatial layout with fixed dimensions. CSS Modules keep styles co-located and scoped with zero framework overhead. |
| CSS Modules | CSS-in-JS (styled-components) | CSS-in-JS adds runtime overhead and bundle size. CSS Modules are compiled at build time by Vite natively. |
| Native fetch | axios / ky | fetch is built-in and sufficient for 2-3 API calls. No need for an HTTP client library. |
| Manual polling | SWR / React Query | These add complexity for a single GET endpoint polled every 60 seconds. A simple `useEffect` + `setInterval` is appropriate. Could reconsider if the app grows more API calls. |

**Installation (in apps/web):**
```bash
npm install react react-dom date-fns lucide-react @laplante/shared
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom
```

**Version verification (2026-05-03):**
| Package | npm view version | Date |
|---------|-----------------|------|
| react | 19.2.5 | confirmed |
| react-dom | 19.2.5 | confirmed |
| vite | 8.0.10 | confirmed |
| @vitejs/plugin-react | 6.0.1 | confirmed |
| typescript | 6.0.3 | confirmed |
| lucide-react | 1.14.0 | confirmed |
| date-fns | 4.1.0 | confirmed |

## Architecture Patterns

### Recommended Project Structure
```
apps/web/
  src/
    main.tsx                 # Entry point, renders App
    App.tsx                  # Root component, data fetching, routing
    App.module.css
    styles/
      tokens.css             # CSS custom properties (colors, spacing, typography)
      reset.css              # Minimal CSS reset
    components/
      Timeline/
        Timeline.tsx         # Main grid container
        Timeline.module.css
      DateHeader/
        DateHeader.tsx       # Sticky top row with day labels
        DateHeader.module.css
      PlantRow/
        PlantRow.tsx         # One row per plant
        PlantRow.module.css
      DayCell/
        DayCell.tsx          # Single day cell (empty/green/amber)
        DayCell.module.css
      NowMarker/
        NowMarker.tsx        # Vertical current-time line + badge
        NowMarker.module.css
      EmptyState/
        EmptyState.tsx
        EmptyState.module.css
      ErrorState/
        ErrorState.tsx
        ErrorState.module.css
      LoadingSkeleton/
        LoadingSkeleton.tsx
        LoadingSkeleton.module.css
    lib/
      api.ts                 # fetch wrapper for server endpoints
      dates.ts               # UI-specific date formatting (day-of-week, day-of-month)
      mock-data.ts           # Hardcoded PlantResponse[] for development
    hooks/
      usePlants.ts           # Data fetching hook (fetch + polling + error/loading states)
      useCurrentTime.ts      # Current time hook for now marker updates
  index.html
  vite.config.ts
  tsconfig.json
  package.json
```

### Pattern 1: Timeline Grid with Sticky Columns and Rows
**What:** A CSS grid where the plant name column is sticky-left and the date header row is sticky-top, with native horizontal scroll for the day cells.
**When to use:** Always -- this IS the main screen.
**Example:**
```css
/* Timeline container -- the scrollable viewport */
.timeline {
  overflow-x: auto;
  overflow-y: auto;
  display: grid;
  /* grid-template-columns set dynamically based on date window */
}

/* Plant name column -- sticky left */
.plantName {
  position: sticky;
  left: 0;
  z-index: 2;
  background: var(--color-bg-secondary);
  width: 160px;
}

/* Date header row -- sticky top */
.dateHeader {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-bg-secondary);
}

/* Top-left corner cell -- sticky both directions */
.cornerCell {
  position: sticky;
  left: 0;
  top: 0;
  z-index: 3; /* highest z-index, above both header and name column */
}
```
**Source:** MDN `position: sticky` docs, Stack Overflow multi-directional sticky patterns.

### Pattern 2: Center on Today via scrollIntoView
**What:** After rendering the grid, programmatically scroll the today column into the center of the viewport.
**When to use:** On initial load and when the date changes (midnight crossover).
**Example:**
```typescript
// After the grid renders, find the today column and center it
const todayCell = document.querySelector('[data-date="2026-05-03"]');
todayCell?.scrollIntoView({ behavior: 'instant', inline: 'center' });
```
**Source:** MDN `scrollIntoView()` documentation.

### Pattern 3: Derived Timeline Window
**What:** Compute a visible date range (e.g., 7 days before today through 7 days after), then map each plant's `futureWateringDates` and `isOverdue` onto that range.
**When to use:** On every data fetch.
**Example:**
```typescript
import { addCalendarDays, todayISO, compareISODate } from '@laplante/shared';

function getVisibleDateRange(pastDays: number, futureDays: number) {
  const today = todayISO();
  return {
    from: addCalendarDays(today, -pastDays),
    to: addCalendarDays(today, futureDays),
  };
}

function getCellStateForDate(
  date: ISODateString,
  plant: PlantResponse
): 'empty' | 'future' | 'overdue' {
  const { schedule } = plant;
  if (schedule.futureWateringDates.includes(date)) return 'future';
  if (schedule.overdueSince && compareISODate(date, schedule.overdueSince) >= 0 && compareISODate(date, todayISO()) <= 0) return 'overdue';
  return 'empty';
}
```

### Pattern 4: Simple Polling Hook
**What:** A custom hook that fetches plant data, handles loading/error states, and re-fetches on a 60-second interval.
**When to use:** In App.tsx for the main data load.
**Example:**
```typescript
function usePlants(from: ISODateString, to: ISODateString) {
  const [plants, setPlants] = useState<PlantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlants = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchPlantsFromAPI(from, to);
      setPlants(data);
    } catch {
      setError('Could not load plants');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchPlants(); // initial load
    const interval = setInterval(fetchPlants, 60_000); // poll every 60s
    return () => clearInterval(interval);
  }, [fetchPlants]);

  return { plants, loading, error, retry: fetchPlants };
}
```

### Anti-Patterns to Avoid
- **Using a full CSS framework for a fixed-dimension grid:** The timeline has ~5 elements with fixed pixel dimensions. Tailwind would add build complexity without benefit. Use CSS Modules + custom properties.
- **Generating the entire grid with JavaScript DOM manipulation:** Use React components to declaratively render rows and cells. The data flow is clean: API response -> state -> JSX grid.
- **Making cell sizes content-dependent:** Cell width and row height MUST be fixed (48px cells, 64px rows) to prevent layout shifts when data changes.
- **Storing timeline state in URL params for v1:** The default view is always centered on today. Scroll position is ephemeral. No need for URL-driven date ranges in Phase 2.
- **Using a table element (`<table>`) for the grid:** CSS grid with `position: sticky` is more flexible than HTML tables for combining sticky rows and columns with scroll. Use `<div>` elements with CSS grid.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date formatting (day-of-week, day-of-month) | Custom date string manipulation | date-fns `format()` with patterns `'d'`, `'EEE'`, `'HH:mm'` | Handles i18n edge cases, locale awareness if needed later. |
| Date arithmetic (add days, compare dates) | Manual Date math | `@laplante/shared` helpers (`addCalendarDays`, `compareISODate`, `todayISO`) | Already implemented, tested, and shared across server and client. |
| Schedule summary computation | Client-side recurrence engine | Server API with `from`/`to` window params + `PlantScheduleSummary` | Server already computes this correctly using `buildScheduleSummary`. |
| CSS scoping | BEM naming or manual prefixing | CSS Modules (`.module.css`) | Vite provides native support -- zero config, zero runtime cost. |
| Icon SVGs | Inline SVG markup | lucide-react | Tree-shakeable, consistent sizing, already specified in UI-SPEC. |

**Key insight:** The heavy lifting for schedule computation is already done server-side. The web app's job is to render `PlantResponse[]` into a grid, not to recompute schedules. Consume the API's derived data directly.

## Common Pitfalls

### Pitfall 1: Sticky Positioning Requires Proper Overflow Container
**What goes wrong:** `position: sticky` has no effect if an ancestor element has `overflow: hidden` or `overflow: auto` on the wrong axis.
**Why it happens:** CSS sticky only works within the nearest scrollable ancestor. If the grid container does not have `overflow-x: auto`, the sticky-left plant name column will not stick.
**How to avoid:** Ensure the timeline container has `overflow-x: auto` and `overflow-y: auto`. Do NOT set overflow on intermediate wrapper elements.
**Warning signs:** Plant name column scrolls away with horizontal scroll.

### Pitfall 2: Z-Index Stacking for Corner Cell
**What goes wrong:** The top-left corner cell (where the sticky header row meets the sticky name column) appears behind either the header or the name column during diagonal scroll.
**Why it happens:** The corner cell needs to be sticky in BOTH directions and needs the HIGHEST z-index.
**How to avoid:** Set the corner cell to `position: sticky; left: 0; top: 0; z-index: 3;` (higher than both the header row `z-index: 1` and the name column `z-index: 2`). Give it a solid background color so it does not show content behind it.
**Warning signs:** Grid content shows through the top-left corner when scrolling diagonally.

### Pitfall 3: scrollIntoView Timing
**What goes wrong:** `scrollIntoView({ inline: 'center' })` is called before the grid has rendered its full width, so the browser cannot calculate the scroll position.
**Why it happens:** React renders asynchronously. The today column element may not exist in the DOM when the effect runs.
**How to avoid:** Use a `useEffect` that depends on the plants data being loaded, and use `requestAnimationFrame` or a small timeout as a safety net. Verify the element exists before calling `scrollIntoView`.
**Warning signs:** Grid loads scrolled to the left edge instead of centered on today.

### Pitfall 4: CSS Grid Column Count vs. Fixed Cell Width
**What goes wrong:** The grid has variable column count (date range can be +/- 7 days = 14+1 columns) but uses `grid-template-columns: repeat(N, 48px)` which must be set dynamically.
**Why it happens:** CSS grid `repeat()` with a fixed count does not adapt to computed date ranges.
**How to avoid:** Compute the column template in JavaScript and set it via inline style: `style={{ gridTemplateColumns: \`160px repeat(${dayCount}, 48px)\` }}`.
**Warning signs:** All cells collapse or stretch because the grid template does not match the actual column count.

### Pitfall 5: Now Marker Alignment Drift
**What goes wrong:** The vertical now-marker line does not align exactly with the today column center because of cell gaps, borders, or padding offsets.
**Why it happens:** Cell gaps (2px between cells) accumulate and shift the marker's calculated position.
**How to avoid:** Position the now-marker relative to the today cell's center using `left: 50%; transform: translateX(-50%)` within the today cell, OR use an absolute-positioned overlay element whose left offset is calculated from the cell index.
**Warning signs:** The blue line is 1-3 pixels off from the center of the today column.

### Pitfall 6: TypeScript Module Resolution for CSS Modules
**What goes wrong:** TypeScript does not understand `.module.css` imports, causing build errors.
**Why it happens:** Vite handles CSS Modules at build time, but TypeScript needs a declaration file.
**How to avoid:** Add a `src/vite-env.d.ts` file with `declare module '*.module.css'`. This is standard Vite practice.
**Warning signs:** TypeScript errors on `import styles from './Component.module.css'`.

## Code Examples

### Vite Config for React + CSS Modules
```typescript
// apps/web/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // If needed for cleaner imports
    }
  },
  server: {
    // Proxy API calls to the Fastify server during development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
```
**Source:** Vite official docs -- proxy configuration and React plugin setup.

### CSS Module Declaration for TypeScript
```typescript
// apps/web/src/vite-env.d.ts
/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```
**Source:** Vite official docs -- CSS Modules, TypeScript integration.

### Design Tokens File
```css
/* apps/web/src/styles/tokens.css */
:root {
  /* Colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8faf8;
  --color-accent: #22c55e;
  --color-overdue: #f59e0b;
  --color-text-primary: #18181b;
  --color-text-secondary: #71717a;
  --color-border: #e4e4e7;
  --color-now-marker: #3b82f6;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Typography */
  --font-body: 16px;
  --font-label: 12px;
  --font-heading: 20px;
  --font-display: 28px;
  --font-weight-regular: 400;
  --font-weight-semibold: 600;

  /* Grid dimensions */
  --cell-size: 48px;
  --cell-gap: 2px;
  --cell-radius: 4px;
  --row-height: 64px;
  --name-column-width: 160px;
  --header-row-height: 56px;
  --dot-size: 20px;
  --marker-width: 2px;
  --icon-size: 32px;
}
```
**Source:** UI-SPEC (02-UI-SPEC.md) approved design tokens.

### API Client
```typescript
// apps/web/src/lib/api.ts
import type { PlantResponse, ISODateString } from '@laplante/shared';

const API_BASE = '/api'; // Proxied to server in dev, same origin in prod

export async function fetchPlants(
  from: ISODateString,
  to: ISODateString
): Promise<PlantResponse[]> {
  const res = await fetch(`${API_BASE}/plants?from=${from}&to=${to}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```
**Source:** Server API routes (apps/server/src/routes/plants.ts) -- `GET /api/plants?from=&to=`.

### Mock Data
```typescript
// apps/web/src/lib/mock-data.ts
import type { PlantResponse } from '@laplante/shared';
import { todayISO, addCalendarDays } from '@laplante/shared';

// Mock data matching the UI-SPEC contract
export function getMockPlants(): PlantResponse[] {
  const today = todayISO();
  return [
    {
      id: 'mock-fern',
      name: 'Fern',
      photoPath: null,
      recurrence: { intervalDays: 3 },
      schedule: {
        nextDueDate: addCalendarDays(today, -2 + 3), // watered 2 days ago, due in 1 day
        isOverdue: false,
        overdueSince: null,
        futureWateringDates: [addCalendarDays(today, 1), addCalendarDays(today, 4)],
      },
    },
    // ... more plants per UI-SPEC mock data table
  ];
}
```
**Source:** UI-SPEC mock data contract (02-UI-SPEC.md).

### Current Time Hook
```typescript
// apps/web/src/hooks/useCurrentTime.ts
import { useState, useEffect } from 'react';

export function useCurrentTime(updateIntervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), updateIntervalMs);
    return () => clearInterval(id);
  }, [updateIntervalMs]);
  return now;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CRA (Create React App) | Vite | CRA deprecated ~2023 | Vite is the standard React project scaffold. Faster HMR and builds. |
| CSS-in-JS runtime | CSS Modules + PostCSS/LightningCSS | Gradual shift 2023+ | Zero-runtime CSS Modules are preferred for performance. Vite supports natively. |
| React class components | React function components + hooks | React 16.8 (2019) | Hooks are the only pattern to use. No class components. |
| HTML tables for grids | CSS Grid + position: sticky | CSS Grid well-supported since 2020 | CSS Grid gives better control over sticky behavior in scroll containers. |

**Deprecated/outdated:**
- Create React App: Deprecated. Use Vite.
- `overflow: scroll` with manual JS scroll position: Use native `overflow-x: auto` + `scrollIntoView` for centering.

## Open Questions

1. **Vite dev proxy vs. CORS configuration**
   - What we know: The server listens on `0.0.0.0:3000`. The web dev server will run on Vite's default port (5173).
   - What's unclear: Whether the web app will be served from the same origin in production (server serves static files) or needs CORS headers.
   - Recommendation: Use Vite proxy for development. For production, have the Fastify server serve the built web app's static files from `apps/web/dist`. This avoids CORS entirely.

2. **Date window recalculation at midnight**
   - What we know: The grid shows 7 past + 7 future days centered on today. The current time updates every 60 seconds.
   - What's unclear: Whether the hook should detect date change (crossing midnight) and recompute the from/to window.
   - Recommendation: Yes -- include midnight detection in the polling logic. When the date portion of `new Date()` changes, recompute the window and re-fetch.

3. **Overdue cell rendering strategy**
   - What we know: `overdueSince` is a single date. The overdue amber cell should appear at the due date position.
   - What's unclear: Whether to show the overdue amber dot on the overdueSince date specifically, or on today's column.
   - Recommendation: Per the UI-SPEC, the overdue cell appears at the position where the watering was due (the `overdueSince` date). This is a single amber dot, not a range.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/dev server | Yes | 25.1.0 | -- |
| npm | Package management | Yes | 11.6.2 | -- |
| Vite | Frontend build | To install | 8.0.10 | -- |
| React | UI framework | To install | 19.2.5 | -- |
| TypeScript | Type checking | Yes (workspace) | 6.0.3 | -- |
| Fastify server | API backend | Yes (Phase 1) | 5.6.1+ | Mock data fallback |
| SQLite | Data persistence | Yes (Phase 1) | -- | Mock data fallback |

**Missing dependencies with no fallback:**
- None -- all dependencies are npm packages or existing workspace code.

**Missing dependencies with fallback:**
- Fastify server: If not running, the web app can use mock data for development. The data source switch is a single import change.

## Sources

### Primary (HIGH confidence)
- Vite official docs (vite.dev) -- CSS Modules support, React plugin, proxy configuration, TypeScript setup
- React official docs (react.dev) -- hooks patterns, component patterns
- MDN Web Docs -- `position: sticky`, `scrollIntoView()`, CSS Grid
- Server source code (apps/server/src/) -- verified API contract: `GET /api/plants?from=&to=` returns `PlantResponse[]`
- Shared package source (packages/shared/src/) -- verified types and date helpers
- UI-SPEC (02-UI-SPEC.md) -- approved design contract with all dimensions, colors, and layout specs
- npm registry (2026-05-03) -- verified package versions

### Secondary (MEDIUM confidence)
- Stack Overflow -- CSS sticky column + horizontal scroll patterns
- Medium -- multi-directional sticky CSS and horizontal scroll in tables

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- versions verified against npm registry, patterns verified against official docs
- Architecture: HIGH -- CSS Grid + sticky pattern is well-documented and widely used. API contract verified against actual server code.
- Pitfalls: HIGH -- sticky positioning z-index and scrollIntoView timing issues are well-known documented problems
- Layout approach: HIGH -- UI-SPEC provides pixel-level specifications for all dimensions

**Research date:** 2026-05-03
**Valid until:** 2026-06-03 (stable -- CSS Grid, React, and Vite APIs do not change rapidly)
