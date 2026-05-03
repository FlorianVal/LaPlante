# LaPlante

## What This Is

LaPlante is a local web interface for tracking when each house plant needs watering. The main screen is a moving date-based table: each row is a plant, the center of the screen marks the current date and time, and future watering dates appear to the right as simple scheduled cells.

The app is intended to run at home on a tablet, backed by a small local server on the home network. It is a practical household tool first: glance at the tablet, see what needs watering, and mark watering as done.

## Core Value

The tablet must make it obvious which plants need watering now and let the user confirm watering with one tap.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Show a day-based timeline table with one row per plant.
- [ ] Keep a vertical current-date marker centered on the main screen.
- [ ] Let each plant have a name, photo, and watering recurrence.
- [ ] Show future watering occurrences as small green cells on the plant row.
- [ ] Show a single yellow overdue alert on a plant row when watering is late.
- [ ] Let the user click the yellow alert to mark the plant as watered and return it to a green/current state.
- [ ] Let the user add a plant from the interface, creating a new row.
- [ ] Persist plant and watering data through a small local server.
- [ ] Optimize the experience for a tablet that stays at home.

### Out of Scope

- Multi-user accounts — the app is local to the household and does not need authentication for v1.
- Cloud sync — the project should run locally at home, not depend on an external service.
- Mobile app store packaging — tablet browser use is enough for v1.
- Hour-level scheduling — watering is tracked by day, keeping the interface readable.
- Showing every missed recurrence — v1 uses one yellow overdue alert per plant to keep the row simple.

## Context

The project started from a concrete household need: follow watering schedules for different plants without relying on memory or a generic checklist. The desired interface is spatial and temporal: plants are rows, days move across the screen, and the current date/hour is represented by a vertical marker at the center.

Future watering dates should feel lightweight, like small green cells. Past missed watering should stand out clearly as yellow, but without creating a cluttered trail of every missed recurrence. The expected daily use is simple: look at the tablet, see the yellow alert, water the plant, tap the alert.

The data model should support at least plants, photos, recurrence settings, scheduled/derived watering dates, and watering confirmations. Because the project is local and tablet-focused, reliability and readability matter more than account systems or external integrations.

## Constraints

- **Deployment**: Runs locally at home on a tablet — should be usable from a browser on the local network.
- **Storage**: Uses a small local server — data should persist outside browser-only storage.
- **Timeline**: Day-based scheduling — one visible unit is a day, not an hour.
- **Overdue UX**: One overdue alert per plant — avoid clutter from multiple missed occurrences.
- **Interface**: Main view is the moving watering table — avoid making the app a generic dashboard first.
- **Input**: Plant creation needs name and photo — adding a plant should immediately create a new row.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use a local server for persistence | The tablet should be a home interface, but data should not live only in one browser storage silo | — Pending |
| Use day-level timeline cells | Plant watering rarely needs hour-level precision, and day cells keep the tablet UI readable | — Pending |
| Show one overdue alert per plant | Missed recurrences should be obvious without overwhelming each row | — Pending |
| Make the table the primary screen | The user's core mental model is a timeline row per plant, not a settings dashboard | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-03 after initialization*
