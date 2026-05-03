@/Users/fvalade/.codex/RTK.md

# LaPlante Project Guidance

This repository uses GSD planning artifacts under `.planning/`.

## Project Shape

- Local web app for tracking household plant watering on a tablet.
- Primary interface is a day-based timeline table with one plant per row.
- A vertical current-date marker stays centered on the main screen.
- Future watering dates appear as green cells.
- Late watering appears as one yellow overdue alert per plant.
- Tapping the yellow alert confirms watering and recalculates the schedule.

## Architecture Direction

- Use a small local server for persistence.
- Prefer TypeScript end to end.
- Recommended stack from research: React + Vite, Fastify, SQLite, Drizzle, date-fns.
- Store recurrence rules and watering confirmations; derive visible timeline cells.
- Store plant photos as files on disk with paths in SQLite.

## Scope Boundaries

- No accounts/auth for v1.
- No cloud sync for v1.
- No native tablet app for v1.
- No hour-level scheduling for v1.
- Do not model every missed watering as a separate task.

## Workflow

- Read `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, and `.planning/ROADMAP.md` before planning implementation.
- Current next step after initialization: `$gsd-discuss-phase 1` or `$gsd-plan-phase 1`.
- Keep changes scoped to the active phase unless the user asks otherwise.
