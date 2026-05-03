# Phase 1: Server and Domain Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 01-server-and-domain-foundation
**Areas discussed:** Schema/API shape, Recurrence semantics, Timeline query semantics

---

## Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| All core areas | Cover schema/API, recurrence semantics, and local runtime defaults so planning has no loose ends. | yes |
| Data/API only | Focus on plant, recurrence, watering-event storage and endpoint behavior. | |
| Recurrence only | Focus on how dates, overdue state, missed intervals, and future visible dates should behave. | |

**User's choice:** All core areas.
**Notes:** User selected option 1.

---

## API Response Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Return plant + schedule summary | Each plant includes derived schedule fields like `nextDueDate`, `isOverdue`, and `futureWateringDates`; keeps the UI simple. | yes |
| Return raw plant data only | UI calls separate logic or endpoint to derive dates; more flexible but easier to duplicate recurrence behavior. | |
| Separate endpoint for schedule summary | Example: `/api/timeline?from=...&to=...`; cleaner for the later timeline but more API surface now. | |

**User's choice:** Return plant plus schedule summary.
**Notes:** User selected option 1.

---

## Plant Creation Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Create plant + recurrence together | `POST /api/plants` requires name and recurrence; Phase 3 can plug into this directly. | yes |
| Create minimal plants first | `POST /api/plants` only creates name/photo placeholders, recurrence added later. | |
| Seed-only for Phase 1 | No public create endpoint yet; use seed data to test recurrence. | |

**User's choice:** Create plant and recurrence together.
**Notes:** User selected option 1.

---

## Late Watering Cadence

| Option | Description | Selected |
|--------|-------------|----------|
| From actual watering date | If watered 3 days late on May 10 with a 7-day recurrence, next due is May 17. | yes |
| From original cadence | If due May 7 and watered May 10, next due is May 14. | |
| Let implementation choose | Planner can pick the simplest rule consistent with one overdue alert. | |

**User's choice:** From actual watering date.
**Notes:** User selected option 1.

---

## First Due Anchor

| Option | Description | Selected |
|--------|-------------|----------|
| User provides last watered date | Create plant with recurrence plus `lastWateredOn`; first due is derived from that. | yes |
| Creation date counts as watered | First due is creation date plus recurrence. | |
| User provides next due date | Direct and flexible, but recurrence logic has to infer or store a separate anchor. | |

**User's choice:** User provides last watered date, with defaulting.
**Notes:** User clarified that if `lastWateredOn` is not set, the server should set it to today.

---

## Recurrence Rule Richness

| Option | Description | Selected |
|--------|-------------|----------|
| Simple interval in days | Store `intervalDays`, like every 7 days. | |
| Named presets plus interval | Store interval, but leave room for presets like weekly/biweekly later. | yes |
| Flexible rule object | Store a more extensible recurrence shape now for future seasonal/weekday rules. | |

**User's choice:** Named presets plus interval.
**Notes:** The locked implementation decision is to store the core recurrence as `intervalDays`, with room for named presets in later API/UI vocabulary. Seasonal and weekday recurrence objects remain out of scope.

---

## Future Watering Window

| Option | Description | Selected |
|--------|-------------|----------|
| Client sends a window | Client sends `from` and `to`; server returns future watering dates within that window. | yes |
| Server returns next N dates | Server always returns a fixed count such as the next 6 watering dates. | |
| Both | Support `from/to` and fallback to next N. | |

**User's choice:** Client sends a window.
**Notes:** User selected option 1.

## the agent's Discretion

- Exact route names and field names.
- SQLite driver choice after local implementation constraints are checked.
- Validation library or route schema style.

## Deferred Ideas

None.
