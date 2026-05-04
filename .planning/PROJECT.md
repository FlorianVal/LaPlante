# LaPlante

## What This Is

LaPlante is a local web interface for tracking when each house plant needs watering. The main screen is a moving date-based table: each row is a plant, the center of the screen marks the current date and time, and future watering dates appear to the right as simple scheduled cells. Overdue plants show a yellow alert that can be tapped to confirm watering.

The app runs at home on a tablet, backed by a small local server on the home network. It is a practical household tool: glance at the tablet, see what needs watering, tap to confirm.

## Core Value

The tablet must make it obvious which plants need watering now and let the user confirm watering with one tap.

## Current State

**Shipped:** v1.0 (2026-05-04)
**Tech stack:** React + Vite + TypeScript, Fastify + SQLite (better-sqlite3), CSS Modules
**LOC:** ~2,450 TypeScript
**Tests:** 17 server tests passing, 4 persistence smoke tests

## Requirements

### Validated (v1.0)

- ✓ Day-based timeline table with one row per plant
- ✓ Vertical current-date marker centered on screen
- ✓ Green future watering cells on plant rows
- ✓ Single yellow overdue alert per plant row
- ✓ Tablet-optimized viewport and tap targets
- ✓ Plant creation with name, photo, and recurrence
- ✓ Tap yellow alert to mark as watered → cell transitions green
- ✓ SQLite persistence through server restart
- ✓ Photo persistence across browser refresh and server restart
- ✓ LAN access via Vite host + server 0.0.0.0 binding

### Active

None — all v1 requirements validated. Next milestone to be defined.

### Out of Scope

- Multi-user accounts — local household tool, no auth needed
- Cloud sync — runs locally, no external service dependency
- Mobile app store packaging — tablet browser is enough
- Hour-level scheduling — day-based keeps interface readable
- Showing every missed recurrence — single yellow alert keeps rows clean
- Editing/deleting plants — deferred to v1.1+

## Context

v1.0 shipped with 4 phases over 2 days. The core household loop works end-to-end: see yellow overdue alert → tap to confirm → cell transitions to green → future dates recalculate from confirmation.

**Known tech debt (non-blocking):**
- Hardcoded #ef4444 error color (should be tokenized)
- Toast uses Check icon for errors (needs type prop)
- Orphaned GET /api/plants/:id route (no web consumer)
- Mock data Orchid entry has contradictory overdue state

## Constraints

- **Deployment**: Local tablet on home network — browser-accessible via LAN
- **Storage**: SQLite + filesystem photos — persists across restarts
- **Timeline**: Day-level scheduling — one cell = one day
- **Overdue UX**: One alert per plant — contiguous yellow block
- **Interface**: Timeline is the primary screen — not a dashboard
- **Input**: Plant creation needs name and photo

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use local Fastify server + SQLite | Tablet needs persistence beyond browser, but no cloud | ✓ Works — 17 tests, data survives restart |
| Day-level timeline cells | Plant watering doesn't need hour precision | ✓ Keeps tablet UI readable |
| One overdue alert per plant | Multiple missed recurrences shouldn't clutter rows | ✓ Single contiguous yellow block |
| Timeline as primary screen | Core mental model is row-per-plant, not settings | ✓ First screen users see |
| CSS Modules + design tokens | Lightweight styling for a small app | ✓ Consistent spacing, color, typography |
| Rectangular cells (56x48) | Wider tap targets for tablet touch | ✓ Better touch UX than square 48x48 |

---
*Last updated: 2026-05-04 after v1.0 milestone*
