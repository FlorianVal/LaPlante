# Phase 1: Server and Domain Foundation - Research

**Researched:** 2026-05-03
**Domain:** TypeScript local server, SQLite persistence, day-based recurrence
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Plant list/detail responses should include a derived schedule summary, not only raw persisted fields.
- **D-02:** The schedule summary should include fields such as `nextDueDate`, overdue state, and future watering dates needed by the later timeline.
- **D-03:** `POST /api/plants` should create a plant and its recurrence together. Recurrence is not deferred to a later endpoint.
- **D-04:** Phase 1 should expose the API foundation that Phase 3 can plug into for plant creation, even if Phase 3 owns the full add-plant UI.
- **D-05:** Late watering resets the cadence from the actual watering confirmation date, not from the originally missed due date.
- **D-06:** Plant creation accepts `lastWateredOn`; when it is omitted, the server defaults it to today.
- **D-07:** The first due date is derived as `lastWateredOn + intervalDays`.
- **D-08:** Store the core recurrence as an interval in days. Named presets can exist in API/UI vocabulary later, but Phase 1 should not introduce seasonal, weekday-specific, or hour-level recurrence objects.
- **D-09:** Future watering dates in schedule summaries should be calculated for a client-provided date window, such as `from` and `to`.
- **D-10:** The server should not return a fixed arbitrary count as the primary model, because the later timeline renders a bounded visible day grid.

### the agent's Discretion
- Exact route names and response field names are flexible as long as the API remains small, typed, and consistent with the decisions above.
- Exact SQLite driver choice is left to implementation after checking local install/runtime constraints.
- Exact validation library or Fastify schema style is flexible, provided API boundaries are validated and typed.

### Deferred Ideas (OUT OF SCOPE)
- Tablet timeline UI, plant photo upload, final yellow-alert tap flow, auth, cloud sync, native tablet app, hour-level scheduling, seasonal rules, weekday-specific recurrence, and one task per missed watering.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Local HTTP server | API/Backend | Browser/Client | Phase 1 must make the app reachable through a local API before UI phases consume it. |
| SQLite data storage | Database/Storage | API/Backend | Plants, recurrence rules, and watering confirmations must survive server restart. |
| Plant creation with recurrence | API/Backend | Database/Storage | `POST /api/plants` owns validation and writes plant plus recurrence atomically. |
| Watering confirmation | API/Backend | Database/Storage | `POST /api/plants/:id/waterings` records an event and returns recalculated state. |
| Schedule summaries | API/Backend | Shared domain logic | The API should return derived `nextDueDate`, overdue state, and `futureWateringDates` for a requested window. |
| Recurrence calculations | Shared domain logic | API/Backend | Date math should be pure TypeScript with direct unit tests and no React dependency. |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 1 should establish a small TypeScript monorepo foundation with a Fastify server, Drizzle-backed SQLite schema, typed shared API/domain types, and pure recurrence functions. There is no existing application code, so planning should create the initial package structure instead of adapting local patterns.

The safest implementation path is to keep recurrence logic separate from persistence and route handlers. Persist plants, recurrence interval rules, and watering confirmation events; derive schedule summaries from the latest confirmation or creation anchor and the client-provided date window. This directly supports one-overdue-alert semantics and avoids generating occurrence rows.

**Primary recommendation:** Build a minimal server package plus shared recurrence package first, then add SQLite/Drizzle persistence and Fastify routes that return schedule summaries for `from`/`to` windows.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | Project install | Server and shared domain code | Keeps API, DB, and recurrence contracts explicit. |
| Fastify | Project install | Local HTTP API | Small server with typed route boundaries and simple health/API endpoints. |
| SQLite | Local file DB | Persistence | Fits a household local app and survives browser/server restarts. |
| Drizzle ORM | Project install | SQLite schema and typed queries | Gives typed schema declarations and avoids ad hoc SQL. |
| better-sqlite3 | Project install | SQLite driver | Simple synchronous local driver commonly paired with Drizzle for small local Node apps. |
| date-fns | Project install | Day-level recurrence math | Provides reliable day arithmetic such as `addDays`, `startOfDay`, and date comparisons. |
| Vitest | Project install | Unit/integration tests | Fast tests for recurrence, persistence, and route behavior. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | Project install | API request validation | Use to validate JSON bodies and query windows before calling services. |
| tsx | Project install | TypeScript dev runner | Use for local server dev scripts before a build pipeline exists. |
| drizzle-kit | Project install | Schema push/migrations | Use `npx drizzle-kit push` to create/update the local SQLite schema. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| better-sqlite3 | sqlite3 | Better fallback if native install fails, but async API adds friction for a tiny local app. |
| Drizzle | Hand-written SQL only | Fewer dependencies, but less type safety and weaker schema workflow. |
| zod | Fastify JSON Schema only | JSON Schema is native to Fastify, but zod keeps request parsing readable for a small codebase. |

**Installation:**
```bash
npm install fastify drizzle-orm better-sqlite3 date-fns zod
npm install -D typescript tsx vitest @types/node drizzle-kit
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### System Architecture Diagram

```text
Tablet/browser client
  -> HTTP JSON request with date window
  -> Fastify route validation
  -> Plant service
  -> Drizzle repository over SQLite
  -> Recurrence service derives schedule summary
  -> JSON response with plant + schedule
```

For watering:

```text
POST /api/plants/:id/waterings
  -> validate plant id and optional wateredOn
  -> insert watering confirmation event
  -> reload plant + recurrence + latest watering
  -> derive nextDueDate, isOverdue, futureWateringDates
  -> return updated plant response
```

### Recommended Project Structure

```text
apps/
  server/
    src/
      index.ts
      app.ts
      config.ts
      routes/
        health.ts
        plants.ts
      db/
        client.ts
        schema.ts
        queries.ts
      services/
        plants.ts
packages/
  shared/
    src/
      dates.ts
      recurrence.ts
      types.ts
data/
  laplante.sqlite
```

### Pattern 1: Store Events, Derive Status
**What:** Persist watering confirmations and recurrence interval; calculate due/overdue state on read.
**When to use:** All schedule summaries and watering confirmations in Phase 1.
**Example:**
```typescript
type WateringEvent = {
  plantId: string;
  wateredOn: string; // YYYY-MM-DD
};
```

### Pattern 2: Client-Provided Timeline Window
**What:** API list/detail endpoints accept `from` and `to` query dates and derive future watering dates inside that inclusive window.
**When to use:** `GET /api/plants` and `GET /api/plants/:id`.
**Example:**
```typescript
type ScheduleWindow = {
  from: string;
  to: string;
};
```

### Pattern 3: Day-Only Date Normalization
**What:** Treat persisted schedule dates as `YYYY-MM-DD`, normalize input dates before arithmetic, and keep hour-level data out.
**When to use:** Plant creation, watering confirmation, recurrence tests, and schedule summaries.

### Anti-Patterns to Avoid
- **Pre-generating occurrences:** Do not create a table of future/past watering tasks; derive visible dates from recurrence and events.
- **Recurrence in routes:** Do not bury date math in Fastify handlers; keep pure functions testable in `packages/shared`.
- **Raw-only API responses:** Do not make later UI phases duplicate recurrence behavior; include schedule summaries in plant responses.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SQL schema/type mapping | String-built SQL everywhere | Drizzle schema and queries | Keeps schema and TypeScript types connected. |
| Date arithmetic | Manual millisecond math | date-fns day helpers | Avoids DST/month-boundary bugs. |
| Request parsing | Trust raw JSON/query values | zod or Fastify schemas | Prevents invalid intervals and malformed dates from reaching domain logic. |
| Test runner | Custom node scripts | Vitest | Clear assertions for recurrence and API behavior. |

**Key insight:** The phase looks small, but date recurrence and persistence boundaries are where correctness can drift; use standard libraries for those edges.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Recurrence Drift
**What goes wrong:** Next due dates shift after late watering or around calendar boundaries.
**Why it happens:** Code mixes timestamps and day-level expectations.
**How to avoid:** Persist `YYYY-MM-DD`, normalize with date-fns, and test late confirmations, omitted `lastWateredOn`, multiple missed intervals, and month boundaries.
**Warning signs:** Tests only cover "today plus 7 days".

### Pitfall 2: Overdue Backlog Modeling
**What goes wrong:** Multiple missed intervals become multiple overdue tasks.
**Why it happens:** The schema stores scheduled occurrence rows instead of recurrence plus events.
**How to avoid:** Store `watering_events` and derive a single `isOverdue` / `overdueSince` state.
**Warning signs:** A `scheduled_tasks` or `occurrences` table appears in Phase 1.

### Pitfall 3: False Persistence Confidence
**What goes wrong:** Tests pass in memory but data disappears after restart.
**Why it happens:** SQLite path is temporary or schema push is skipped.
**How to avoid:** Configure `data/laplante.sqlite`, include a Drizzle schema push task, and add a persistence test that reopens the DB client.
**Warning signs:** Only route tests run against in-memory state.

### Pitfall 4: LAN Access Deferred Too Far
**What goes wrong:** Server works only on localhost from the developer machine.
**Why it happens:** Host binding and run docs are not explicit.
**How to avoid:** Default server host to `0.0.0.0` for local network dev or document `HOST` clearly, and expose a health endpoint.
**Warning signs:** Scripts hardcode `localhost` as the listen host.
</common_pitfalls>

<phase_plan_implications>
## Phase Plan Implications

- Create root npm workspaces and `apps/server` / `packages/shared` before any feature code.
- Put recurrence logic in `packages/shared/src/recurrence.ts` with direct Vitest coverage.
- Put Drizzle schema in `apps/server/src/db/schema.ts` with `plants`, `recurrence_rules`, and `watering_events`.
- Add a `[BLOCKING]` schema push task using `npx drizzle-kit push` after schema files exist.
- Add API endpoints only after recurrence and persistence layers exist:
  - `GET /health`
  - `GET /api/plants?from=YYYY-MM-DD&to=YYYY-MM-DD`
  - `GET /api/plants/:id?from=YYYY-MM-DD&to=YYYY-MM-DD`
  - `POST /api/plants`
  - `POST /api/plants/:id/waterings`
- Verify with `npm test`, `npm run typecheck`, and server/API smoke checks.
</phase_plan_implications>

## RESEARCH COMPLETE
