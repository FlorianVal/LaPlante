---
phase: 01-server-and-domain-foundation
plan: "04"
subsystem: plant-api
tags: [fastify, api, recurrence, persistence, tests]
key-files:
  created:
    - apps/server/src/routes/plants.ts
    - apps/server/src/services/plants.ts
    - apps/server/src/test/plants.routes.test.ts
  modified:
    - apps/server/src/app.ts
    - apps/server/package.json
    - packages/shared/package.json
metrics:
  tasks_completed: 4
  tests_added: 6
---

# Plan 01-04 Summary: Plant and Watering API

## What Changed

Added the Phase 1 plant service and Fastify API routes for listing plants, reading plant detail, creating plants with recurrence, and recording watering confirmations. API responses include derived schedule summaries from the shared recurrence layer, including `nextDueDate`, overdue state, and `futureWateringDates`.

The app factory now wires the database and plant routes while preserving `/health`. Tests cover plant creation, omitted `lastWateredOn` defaulting to today, future windows, late watering reset from actual `wateredOn`, one overdue state for multiple missed intervals, and persistence after reopening the database.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1-4 | pending in final commit | Added plant service, API routes, validation, route integration tests, and package dependency ownership updates. |

## Verification

| Command | Result |
|---------|--------|
| `npm --workspace @laplante/server run typecheck` | PASS |
| `npm --workspace @laplante/server test -- plants` | PASS |
| `npm --workspace @laplante/server test -- plants.routes` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS, 5 files and 14 tests |

## Deviations from Plan

- Added `exports` and package-level dependency declarations so server/shared imports resolve through workspace packages instead of relying on root hoisting.
- The final live `npm run dev:server` smoke could not be rerun because the approval layer hit its usage limit. The earlier Wave 1 live `/health` smoke passed, and the Phase 1 API endpoints were verified through Fastify route integration tests.

**Total deviations:** 2 auto-handled.
**Impact:** API behavior is covered by automated route tests; no UI or photo upload scope was introduced.

## Self-Check: PASSED

- `GET /api/plants` and `GET /api/plants/:id` return plant data with derived schedule summaries.
- `POST /api/plants` creates a plant and recurrence together.
- `POST /api/plants/:id/waterings` records a watering confirmation and recalculates from actual `wateredOn`.
- Multiple missed recurrence intervals return one overdue state, not a backlog.
- Plant and watering API data remain available after reopening the database.
