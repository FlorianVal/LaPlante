# Project Research Summary

**Project:** LaPlante
**Domain:** local tablet web app with home-network persistence
**Researched:** 2026-05-03
**Confidence:** HIGH

## Executive Summary

LaPlante should be built as a small local-first web app: a React/Vite tablet interface backed by a Fastify server and SQLite database. The product is not a generic plant-care platform; the central product shape is the timeline table where each plant has a row, future watering dates are visible, and a centered now marker anchors the screen.

The recommended technical approach is deliberately modest. Store plants, recurrence rules, and watering confirmations in SQLite; store photos as files on disk; derive the visible timeline and overdue state from recurrence plus confirmation history. This keeps the app reliable on a home tablet while avoiding cloud sync, accounts, notifications, and other distractions.

The main risks are date recurrence drift, cluttered overdue behavior, and a timeline layout that does not hold up on tablet. These should be handled early through pure recurrence tests, one-alert overdue semantics, and a stable grid layout verified in a tablet viewport.

## Key Findings

### Recommended Stack

Use TypeScript end to end. React + Vite is the best fit for the interactive tablet UI, while Fastify + SQLite + Drizzle gives a small local server with typed persistence and clean route boundaries.

**Core technologies:**
- TypeScript: shared client/server language - protects date and API contracts.
- React: tablet UI - fits interactive row/cell rendering and dialogs.
- Vite: frontend dev/build - simple local dev and production build.
- Fastify: local API server - small, typed, plugin-friendly.
- SQLite + Drizzle: persistence - local data, typed schema, no cloud dependency.
- date-fns: recurrence dates - day arithmetic and comparisons.

### Expected Features

**Must have (table stakes):**
- Plant rows with name and photo.
- Add plant flow.
- Watering recurrence per plant.
- Day-based timeline with centered current marker.
- Future green watering cells.
- One yellow overdue alert per late plant.
- Tap-to-confirm watering.
- Local server persistence.

**Should have (competitive):**
- Tablet-first layout with stable row/cell sizing.
- Kiosk-friendly main screen.
- Derived one-alert overdue model instead of missed-task backlog.

**Defer (v2+):**
- Accounts/auth.
- Cloud sync.
- Full calendar view.
- Hour precision.
- Complex seasonal recurrence rules.
- Multi-device live updates.

### Architecture Approach

Use a simple layered architecture: tablet browser -> Fastify API -> domain services -> SQLite/photo storage. The recurrence service should be pure TypeScript and tested directly. The UI should render a bounded date window around today, with day cells derived from recurrence rather than stored as infinite scheduled tasks.

**Major components:**
1. Timeline UI - renders rows, day columns, current marker, future cells, overdue alert.
2. Plant creation - captures name, photo, and recurrence.
3. Fastify API - exposes plant, upload, and watering confirmation endpoints.
4. Recurrence service - calculates due dates, overdue state, and future cells.
5. SQLite persistence - stores plants, recurrence rules, and watering events.
6. Photo storage - stores image files and database paths.

### Critical Pitfalls

1. **Recurrence drift** - normalize to day-level dates and test edge cases.
2. **Timeline layout jank** - use stable grid dimensions and tablet screenshot checks.
3. **Photo upload fragility** - enforce size limits, stream files, and generate safe names.
4. **Overdue backlog clutter** - derive one alert per plant, do not create one task per missed occurrence.
5. **Local server assumptions** - verify tablet/LAN access, not just localhost.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Server and Domain Foundation

**Rationale:** Recurrence and persistence drive the whole app; get the data model right before polishing UI.
**Delivers:** Fastify server, SQLite/Drizzle schema, plant + recurrence + watering event model, pure recurrence functions.
**Addresses:** Persistence, recurrence, due/overdue calculation.
**Avoids:** Recurrence drift and infinite scheduled occurrence storage.

### Phase 2: Timeline Main Screen

**Rationale:** The table is the product; validate the main spatial model early.
**Delivers:** React/Vite app, plant rows, day window, centered now marker, future green cells, overdue yellow alert.
**Uses:** React, Vite, date-fns, API client.
**Implements:** Timeline UI and derived schedule display.

### Phase 3: Plant Creation and Photos

**Rationale:** The app needs household-specific plant rows with visual identity.
**Delivers:** Add plant flow, photo upload, photo serving, row insertion.
**Uses:** Fastify multipart, photo directory, SQLite metadata.
**Implements:** Plant form and image storage.

### Phase 4: Watering Confirmation and Tablet Polish

**Rationale:** The core daily loop is seeing yellow, watering, tapping to confirm.
**Delivers:** Tap-to-confirm overdue alert, row refresh, tablet layout refinement, local-network run instructions.
**Addresses:** Core value end to end.
**Avoids:** Local server assumptions and tap target issues.

### Phase Ordering Rationale

- Build recurrence and persistence before UI actions depend on them.
- Build the timeline before secondary management screens so the main product shape stays dominant.
- Add photo upload after the plant model exists.
- Finish with the full tablet loop and verification from a home-style local deployment.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** SQLite driver choice may depend on native install constraints.
- **Phase 3:** Image resizing/compression may need a library decision if raw uploads are too large.

Phases with standard patterns (skip research-phase):
- **Phase 2:** React/Vite component patterns are well documented.
- **Phase 4:** Confirmation flow is mostly product-specific, not library-specific.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified through official docs and npm version checks. |
| Features | HIGH | Directly derived from user intent and local tablet use case. |
| Architecture | HIGH | Simple local client/server/SQLite architecture matches constraints. |
| Pitfalls | HIGH | Risks follow from date recurrence, uploads, tablet layout, and LAN use. |

**Overall confidence:** HIGH

### Gaps to Address

- **SQLite driver:** Choose during implementation after checking install/runtime constraints.
- **Photo handling:** Decide whether v1 only stores uploaded files or also resizes them.
- **Visible date window:** Tune number of past/future days once the UI is built on tablet dimensions.

## Sources

### Primary (HIGH confidence)

- `/vitejs/vite` - Vite dev server, build, preview, and TypeScript guidance.
- `/reactjs/react.dev` - component and local state patterns.
- `/fastify/fastify` - Fastify TypeScript server, routes, plugins, validation.
- `/fastify/fastify-multipart` - file upload stream handling and limits.
- `/drizzle-team/drizzle-orm-docs` - SQLite schema and typed query patterns.
- `/date-fns/date-fns` - day-based date arithmetic.
- npm registry - package versions checked on 2026-05-03.

### Secondary (MEDIUM confidence)

- `.planning/PROJECT.md` - product-specific intent and constraints from questioning.

---
*Research completed: 2026-05-03*
*Ready for roadmap: yes*
