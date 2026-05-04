# Phase 1: Server and Domain Foundation - Pattern Map

**Mapped:** 2026-05-03
**Status:** No existing application code

## Existing Pattern Summary

The repository currently contains planning artifacts only. There are no local TypeScript, Fastify, Drizzle, SQLite, or test files to mirror.

## Closest Available Patterns

| Planned File | Role | Closest Existing Analog | Guidance |
|--------------|------|-------------------------|----------|
| `package.json` | Root workspace and scripts | None | Create conservative npm workspace scripts for server/shared packages. |
| `tsconfig.base.json` | Shared TypeScript settings | None | Use strict TypeScript and Node-oriented module resolution. |
| `apps/server/src/app.ts` | Fastify app construction | Project research | Keep app factory separate from listen entrypoint for tests. |
| `apps/server/src/index.ts` | Server startup | Project research | Read `HOST`, `PORT`, and SQLite path from config/env. |
| `apps/server/src/db/schema.ts` | Drizzle SQLite schema | Project research | Store plants, recurrence rules, and watering events; do not add occurrence/task rows. |
| `apps/server/src/routes/plants.ts` | Plant and watering routes | Phase context | Return plant responses with derived schedule summaries. |
| `packages/shared/src/recurrence.ts` | Pure recurrence functions | Phase context | Implement `lastWateredOn + intervalDays`, late reset, one-overdue-state semantics. |

## Executor Notes

- Read `.planning/phases/01-server-and-domain-foundation/01-CONTEXT.md` before choosing names; D-01 through D-10 are locked.
- Do not create UI files in Phase 1.
- Do not create photo upload storage in Phase 1; leave a nullable `photoPath` field if useful for future phases.
- Use `data/laplante.sqlite` as the local default DB path so restart persistence is visible.

## PATTERN MAPPING COMPLETE
