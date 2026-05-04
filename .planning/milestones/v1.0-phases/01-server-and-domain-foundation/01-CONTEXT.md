# Phase 1: Server and Domain Foundation - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the local Fastify server, SQLite persistence, API shape, and pure recurrence logic that later UI phases depend on. This phase covers plants, recurrence rules, watering confirmations, derived schedule summaries, and restart-safe persistence. It does not build the tablet timeline UI, plant photo upload, or the final yellow-alert tap flow.

</domain>

<decisions>
## Implementation Decisions

### API Shape
- **D-01:** Plant list/detail responses should include a derived schedule summary, not only raw persisted fields.
- **D-02:** The schedule summary should include fields such as `nextDueDate`, overdue state, and future watering dates needed by the later timeline.
- **D-03:** `POST /api/plants` should create a plant and its recurrence together. Recurrence is not deferred to a later endpoint.
- **D-04:** Phase 1 should expose the API foundation that Phase 3 can plug into for plant creation, even if Phase 3 owns the full add-plant UI.

### Recurrence Semantics
- **D-05:** Late watering resets the cadence from the actual watering confirmation date, not from the originally missed due date.
- **D-06:** Plant creation accepts `lastWateredOn`; when it is omitted, the server defaults it to today.
- **D-07:** The first due date is derived as `lastWateredOn + intervalDays`.
- **D-08:** Store the core recurrence as an interval in days. Named presets can exist in API/UI vocabulary later, but Phase 1 should not introduce seasonal, weekday-specific, or hour-level recurrence objects.

### Timeline Query Semantics
- **D-09:** Future watering dates in schedule summaries should be calculated for a client-provided date window, such as `from` and `to`.
- **D-10:** The server should not return a fixed arbitrary count as the primary model, because the later timeline renders a bounded visible day grid.

### the agent's Discretion
- Exact route names and response field names are flexible as long as the API remains small, typed, and consistent with the decisions above.
- Exact SQLite driver choice is left to implementation after checking local install/runtime constraints.
- Exact validation library or Fastify schema style is flexible, provided API boundaries are validated and typed.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Scope
- `.planning/PROJECT.md` — Product intent, core value, constraints, and out-of-scope boundaries.
- `.planning/REQUIREMENTS.md` — Phase 1 requirement mapping: SERV-01 through SERV-04, PLNT-03, WATR-03, WATR-04, PERS-01, and PERS-02.
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, and notes.

### Research
- `.planning/research/SUMMARY.md` — Recommended stack, architecture approach, risks, and phase rationale.
- `.planning/research/ARCHITECTURE.md` — Layered local architecture, derived timeline window, event-history model, and anti-patterns.
- `.planning/research/STACK.md` — Recommended TypeScript/Fastify/SQLite/Drizzle/date-fns stack and SQLite driver caveat.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No application code exists yet. The repository currently contains planning artifacts only.

### Established Patterns
- Planning docs recommend a TypeScript end-to-end structure with `apps/web`, `apps/server`, and optionally `packages/shared`.
- Domain recurrence logic should live outside React components and be implemented as pure TypeScript functions with direct tests.
- Persistence should store recurrence rules and watering confirmations, then derive visible occurrences and overdue state.

### Integration Points
- New server code should connect to the later React/Vite app through HTTP JSON endpoints.
- SQLite should persist plants, recurrence rules, and watering confirmations so plants and watering history survive refresh and server restart.
- Future photo storage belongs to Phase 3, but the plant model should leave room for a photo path without requiring upload implementation in Phase 1.

</code_context>

<specifics>
## Specific Ideas

- API responses should make the later UI simple by including derived schedule summary data with plants.
- Creation should support `lastWateredOn`, but default it to today if the user does not provide it.
- Late watering should feel household-practical: watering on May 10 with a 7-day recurrence means the next due date is May 17.
- Future watering dates should be generated for the visible timeline window requested by the client.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-server-and-domain-foundation*
*Context gathered: 2026-05-03*
