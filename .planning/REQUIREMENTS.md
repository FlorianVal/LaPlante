# Requirements: LaPlante

**Defined:** 2026-05-03
**Core Value:** The tablet must make it obvious which plants need watering now and let the user confirm watering with one tap.

## v1 Requirements

Requirements for the initial local tablet release. Each maps to roadmap phases.

### Server

- [ ] **SERV-01**: The app runs through a local server reachable from a tablet on the home network.
- [ ] **SERV-02**: The server persists data in a local SQLite database.
- [ ] **SERV-03**: The server exposes API endpoints to list, create, and update plants.
- [ ] **SERV-04**: The server exposes an API endpoint to record a watering confirmation for a plant.

### Plants

- [ ] **PLNT-01**: User can add a plant with a required name.
- [ ] **PLNT-02**: User can attach a photo when adding a plant.
- [ ] **PLNT-03**: User can define a day-based watering recurrence for each plant.
- [ ] **PLNT-04**: Newly added plants appear as new rows in the main timeline.

### Timeline

- [x] **TIME-01**: User sees a day-based timeline table as the main screen.
- [x] **TIME-02**: Each plant is displayed on its own timeline row.
- [x] **TIME-03**: The current date/time is represented by a vertical marker centered on the screen.
- [x] **TIME-04**: Future watering dates are displayed as small green cells to the right of the current marker.
- [x] **TIME-05**: Timeline layout remains readable and aligned on a tablet viewport.

### Watering

- [ ] **WATR-01**: User sees one yellow overdue alert on a plant row when that plant is late for watering.
- [ ] **WATR-02**: User can tap the yellow overdue alert to mark the plant as watered.
- [ ] **WATR-03**: After watering is confirmed, the overdue alert disappears and the plant schedule recalculates from the confirmation.
- [ ] **WATR-04**: Multiple missed recurrence intervals still produce only one overdue alert per plant.

### Persistence

- [ ] **PERS-01**: Plants remain available after browser refresh.
- [ ] **PERS-02**: Plants and watering history remain available after server restart.
- [ ] **PERS-03**: Plant photos remain available after browser refresh and server restart.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Plant Management

- **PMGT-01**: User can edit an existing plant's name, photo, and recurrence.
- **PMGT-02**: User can delete a plant.
- **PMGT-03**: User can reorder plant rows.
- **PMGT-04**: User can manually mark a plant as watered before it is overdue.

### Reliability

- **RELY-01**: User can export a backup file containing plants, recurrence rules, and watering history.
- **RELY-02**: User can import a backup file to restore the app.

### Advanced Scheduling

- **SCHD-01**: User can define seasonal watering rules.
- **SCHD-02**: User can define weekday-specific watering rules.
- **SCHD-03**: User can configure morning/evening precision.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts and login | Local household tool; no auth needed for v1. |
| Cloud sync | Project should work locally at home without external services. |
| Native mobile/tablet app | Browser on tablet is enough for v1. |
| Full calendar interface | The product is a plant-row timeline, not a generic calendar. |
| Hour-level scheduling | Day-level scheduling keeps the timeline readable. |
| One task per missed watering | v1 intentionally shows one overdue alert per plant. |
| Notifications | The always-visible tablet screen is the v1 reminder mechanism. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SERV-01 | Phase 1, Phase 4 | Pending |
| SERV-02 | Phase 1 | Implemented |
| SERV-03 | Phase 1 | Implemented |
| SERV-04 | Phase 1 | Implemented |
| PLNT-01 | Phase 3 | Pending |
| PLNT-02 | Phase 3 | Pending |
| PLNT-03 | Phase 1, Phase 3 | Partially implemented |
| PLNT-04 | Phase 3 | Pending |
| TIME-01 | Phase 2 | Complete |
| TIME-02 | Phase 2 | Complete |
| TIME-03 | Phase 2 | Complete |
| TIME-04 | Phase 2 | Complete |
| TIME-05 | Phase 2, Phase 4 | Complete |
| WATR-01 | Phase 4 | Pending |
| WATR-02 | Phase 4 | Pending |
| WATR-03 | Phase 1, Phase 4 | Partially implemented |
| WATR-04 | Phase 1, Phase 4 | Partially implemented |
| PERS-01 | Phase 1, Phase 4 | Partially implemented |
| PERS-02 | Phase 1, Phase 4 | Partially implemented |
| PERS-03 | Phase 3, Phase 4 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0

---
*Requirements defined: 2026-05-03*
*Last updated: 2026-05-03 after Phase 1 execution*
