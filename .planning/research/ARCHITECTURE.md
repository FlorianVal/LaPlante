# Architecture Research

**Domain:** local plant watering tracker
**Researched:** 2026-05-03
**Confidence:** HIGH

## Standard Architecture

### System Overview

```text
Tablet browser
  |
  | HTTP JSON + multipart upload
  v
Fastify local server
  |
  | typed services
  v
SQLite database + photo directory
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Timeline UI | Render plant rows, day cells, now marker, overdue states. | React components with derived view model. |
| Plant form | Add plant name, photo, and recurrence. | React modal/form posting JSON and multipart data. |
| API routes | Expose plants, photo upload, and watering confirmation endpoints. | Fastify route modules with validation. |
| Domain services | Compute due dates, overdue state, and next watering. | Pure TypeScript functions, unit tested. |
| Database layer | Persist plants, recurrence rules, and watering events. | Drizzle schema + queries over SQLite. |
| Photo storage | Store uploaded plant images. | Files in `data/photos`, path referenced from SQLite. |

## Recommended Project Structure

```text
apps/
  web/
    src/
      components/       # Timeline, plant row, dialogs, controls
      features/plants/  # Plant UI and API client functions
      features/timeline/# Timeline view-model and layout helpers
      styles/           # App CSS
  server/
    src/
      routes/           # Fastify API routes
      services/         # Recurrence and watering domain logic
      db/               # Drizzle schema, migrations, queries
      storage/          # Photo file handling
packages/
  shared/
    src/                # Shared types and date helpers if needed
data/
  photos/               # Uploaded plant photos
  laplante.sqlite       # Local database
```

### Structure Rationale

- **apps/web:** Keeps the tablet UI independent from persistence details.
- **apps/server:** Keeps local server logic explicit and deployable as one process.
- **services:** Recurrence math should be pure and testable away from UI.
- **data:** Makes backup and local deployment easy to understand.

## Architectural Patterns

### Pattern 1: Derived Timeline Window

**What:** Compute a visible date range around today, then render each plant against that range.
**When to use:** Always in the main timeline.
**Trade-offs:** Avoids storing infinite future occurrences, but requires reliable derived calculations.

```typescript
type TimelineDay = {
  date: string;
  offsetFromToday: number;
};
```

### Pattern 2: Event History, Derived Status

**What:** Store watering confirmations as events; derive overdue/next due from recurrence and history.
**When to use:** For overdue alerts and future cells.
**Trade-offs:** More robust than mutating scheduled tasks, but recurrence logic needs tests.

```typescript
type WateringEvent = {
  plantId: string;
  wateredOn: string;
};
```

### Pattern 3: Files on Disk, Metadata in DB

**What:** Save uploaded image files in a photo directory; store filename/path in SQLite.
**When to use:** For plant photos.
**Trade-offs:** Simple and local, but backups must include both SQLite and photo directory.

## Data Flow

### Request Flow

```text
User taps yellow alert
  -> React handler
  -> POST /api/plants/:id/waterings
  -> Watering service records today's event
  -> SQLite insert
  -> API returns updated plant schedule summary
  -> Timeline row rerenders green/future cells
```

### State Management

```text
Server state: plants, photos, watering events
Client state: current visible date window, open dialogs, form input
Derived state: next due date, overdue flag, future occurrence cells
```

### Key Data Flows

1. **Load main screen:** web app fetches plants and schedule summaries, computes timeline row layout, displays now marker.
2. **Add plant:** form uploads photo, creates plant + recurrence, app inserts row.
3. **Confirm watering:** user taps overdue alert, server stores watering event, UI refreshes row.
4. **Daily movement:** UI recalculates visible window around current date; no manual rollover job needed for v1.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 household, 1 tablet | Monorepo local server + SQLite is enough. |
| Multiple household devices | Add polling/refetch and optional LAN access controls. |
| Many users/cloud | Out of scope; would require auth, hosting, backups, and multi-tenant data. |

### Scaling Priorities

1. **First bottleneck:** UI readability as plants increase; solve with row height, grouping, and horizontal range controls.
2. **Second bottleneck:** Photo size/storage; solve with upload limits and image resizing.

## Anti-Patterns

### Anti-Pattern 1: Pre-generating Infinite Occurrences

**What people do:** Store every future watering date as rows in the database.
**Why it's wrong:** Creates churn and makes recurrence changes awkward.
**Do this instead:** Store recurrence rule + events, derive visible dates.

### Anti-Pattern 2: Treating Overdue as a Separate Todo System

**What people do:** Create one task per missed watering.
**Why it's wrong:** Produces backlog clutter and conflicts with the one-alert UX.
**Do this instead:** Derive one overdue alert from last watering and recurrence.

### Anti-Pattern 3: Designing Settings First

**What people do:** Start with admin screens and forms.
**Why it's wrong:** The core product is the table on the tablet.
**Do this instead:** Build the timeline shell early, then connect forms into it.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| None in v1 | Not applicable | Local-first is intentional. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Web -> Server | HTTP JSON + multipart | Keep API small and explicit. |
| Server -> DB | Drizzle queries | Keep recurrence services separate from query code. |
| Server -> Photo storage | File stream to disk | Generate safe filenames and enforce size limits. |

## Sources

- `/vitejs/vite` via Context7 - dev/build structure.
- `/reactjs/react.dev` via Context7 - interactive component and state patterns.
- `/fastify/fastify` via Context7 - route/plugin/server patterns.
- `/fastify/fastify-multipart` via Context7 - upload stream handling.
- `/drizzle-team/drizzle-orm-docs` via Context7 - SQLite schema patterns.

---
*Architecture research for: LaPlante*
*Researched: 2026-05-03*
