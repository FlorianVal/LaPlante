# Roadmap: LaPlante

**Created:** 2026-05-03
**Granularity:** Coarse
**Mode:** YOLO
**Requirements covered:** 20/20

## Phase Overview

| Phase | Name | Goal | Requirements | UI hint |
|-------|------|------|--------------|---------|
| 1 | Server and Domain Foundation | Establish local persistence, API shape, and recurrence logic. | SERV-01, SERV-02, SERV-03, SERV-04, PLNT-03, WATR-03, WATR-04, PERS-01, PERS-02 | no |
| 2 | Timeline Main Screen | 1/2 | In Progress|  |
| 3 | Plant Creation and Photos | Let the user add plants with names, photos, and recurrence settings. | PLNT-01, PLNT-02, PLNT-04, PERS-03 | yes |
| 4 | Watering Confirmation and Tablet Polish | Complete the yellow-alert watering loop and verify local tablet use. | WATR-01, WATR-02, SERV-01, TIME-05, PERS-01, PERS-02, PERS-03 | yes |

## Phase Details

### Phase 1: Server and Domain Foundation

**Goal:** Establish local persistence, API shape, and recurrence logic before the UI depends on it.

**Status:** Complete — implemented and verified on 2026-05-03.

**Requirements:** SERV-01, SERV-02, SERV-03, SERV-04, PLNT-03, WATR-03, WATR-04, PERS-01, PERS-02

**UI hint:** no

**Success criteria:**
1. A local Fastify server starts and exposes health/API endpoints.
2. SQLite persistence stores plants, recurrence rules, and watering confirmations.
3. Pure recurrence logic calculates next due date, overdue state, and future visible dates.
4. Multiple missed intervals derive one overdue state per plant.
5. Server restart preserves plant and watering history.

**Notes:**
- Choose the SQLite driver during this phase.
- Keep recurrence logic outside React components.
- Avoid pre-generating infinite watering occurrence rows.

**Plans:**

| Wave | Plan | What it builds |
|------|------|----------------|
| 1 | `01-01` | TypeScript workspace and minimal Fastify health server. Complete. |
| 2 | `01-02` | Pure recurrence logic and tests for due dates, overdue state, and future windows. Complete. |
| 2 | `01-03` | Drizzle SQLite schema, query layer, persistence tests, and blocking schema push. Complete. |
| 3 | `01-04` | Plant/watering API routes combining persistence with derived schedule summaries. Complete. |

**Wave 2 depends on Wave 1 completion. Wave 3 depends on Wave 2 completion.**

**Cross-cutting constraints:**
- Schedule summaries must expose derived due/overdue/future-date data instead of raw persistence only.
- Recurrence must remain day-level and interval-based.
- Watering confirmations reset cadence from the actual confirmation date.
- Persistence must use recurrence rules and watering events, not generated occurrence rows.

### Phase 2: Timeline Main Screen

**Goal:** Build the tablet-first watering timeline as the main screen.

**Requirements:** TIME-01, TIME-02, TIME-03, TIME-04, TIME-05

**UI hint:** yes

**Success criteria:**
1. The first screen is the day-based plant timeline, not a landing page or settings dashboard.
2. Each plant appears as one row with stable row height.
3. The current date/time marker is vertically centered and aligned with the day grid.
4. Future watering dates appear as small green cells to the right of the marker.
5. The layout remains readable and aligned on a tablet viewport.

**Notes:**
- Use a bounded date window around today.
- Keep day cell width and row height stable.
- Use placeholder/mock plant data if Phase 3 is not done yet.

**Plans:** 1/2 plans executed

Plans:
- [x] 02-01-PLAN.md — Scaffold apps/web with React/Vite, design tokens, mock data, and all timeline components (DayCell, PlantRow, DateHeader, NowMarker, states).
- [ ] 02-02-PLAN.md — Wire live API data with usePlants hook, 60s polling, scroll-to-today centering, and midnight crossover detection.

**Plan 02 depends on Plan 01 completion.**

### Phase 3: Plant Creation and Photos

**Goal:** Let the user add household plants with visual identity and recurrence settings.

**Requirements:** PLNT-01, PLNT-02, PLNT-03, PLNT-04, PERS-03

**UI hint:** yes

**Success criteria:**
1. User can open an add-plant flow from the main interface.
2. User can enter a required plant name.
3. User can attach a photo and see it on the plant row.
4. User can define a day-based recurrence for the plant.
5. Newly added plants appear as new timeline rows and persist after refresh/restart.

**Notes:**
- Store photo files on disk and metadata paths in SQLite.
- Enforce upload limits and safe filenames.
- Editing/deleting plants remains v2 unless needed for v1 verification.

### Phase 4: Watering Confirmation and Tablet Polish

**Goal:** Complete the daily household loop: see yellow, water the plant, tap to confirm, see the row update.

**Requirements:** WATR-01, WATR-02, WATR-03, WATR-04, SERV-01, TIME-05, PERS-01, PERS-02, PERS-03

**UI hint:** yes

**Success criteria:**
1. A late plant shows one clear yellow overdue alert on its row.
2. Tapping the yellow alert records watering for that plant.
3. After confirmation, the alert disappears and future green cells recalculate.
4. Multiple missed recurrences still show one alert, not a backlog of yellow cells.
5. The app can be loaded from a tablet or LAN-style host and remains usable after refresh/restart.

**Notes:**
- Verify tap targets on tablet dimensions.
- Document local run/access path.
- Keep notification and cloud concerns out of v1.

## Requirement Coverage

| Requirement | Phase |
|-------------|-------|
| SERV-01 | Phase 1, Phase 4 |
| SERV-02 | Phase 1 |
| SERV-03 | Phase 1 |
| SERV-04 | Phase 1 |
| PLNT-01 | Phase 3 |
| PLNT-02 | Phase 3 |
| PLNT-03 | Phase 1, Phase 3 |
| PLNT-04 | Phase 3 |
| TIME-01 | Phase 2 |
| TIME-02 | Phase 2 |
| TIME-03 | Phase 2 |
| TIME-04 | Phase 2 |
| TIME-05 | Phase 2, Phase 4 |
| WATR-01 | Phase 4 |
| WATR-02 | Phase 4 |
| WATR-03 | Phase 1, Phase 4 |
| WATR-04 | Phase 1, Phase 4 |
| PERS-01 | Phase 1, Phase 4 |
| PERS-02 | Phase 1, Phase 4 |
| PERS-03 | Phase 3, Phase 4 |

**Coverage:** 20/20 v1 requirements mapped.

## Roadmap Validation

- [x] Every v1 requirement maps to at least one phase.
- [x] Phase order follows technical dependencies.
- [x] Timeline UI is introduced before secondary management screens dominate.
- [x] Core value is completed end to end by Phase 4.

---
*Roadmap created: 2026-05-03*
