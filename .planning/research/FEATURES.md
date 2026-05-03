# Feature Research

**Domain:** local plant watering tracker
**Researched:** 2026-05-03
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Plant list | The app exists to track multiple plants. | LOW | Each plant needs name, photo, recurrence, and row order. |
| Add plant | Household plant lists change. | LOW | Add flow should create a row immediately. |
| Plant photo | Visual recognition matters on a tablet at home. | MEDIUM | Requires upload, storage path, and responsive cropping. |
| Watering recurrence | Core scheduling mechanic. | MEDIUM | v1 can support every N days from a start/last-watered date. |
| Timeline table | The user's primary mental model. | HIGH | Rows are plants; columns are days; current date marker is centered. |
| Future watering cells | Users need to see upcoming watering without opening details. | MEDIUM | Future cells can be derived from recurrence, not pre-created forever. |
| Overdue alert | Missed watering must stand out. | MEDIUM | One yellow alert per plant in v1. |
| Confirm watering | The core action is marking a plant watered. | MEDIUM | Tap overdue alert, create confirmation, recalculate next due date. |
| Persistence | Data must survive refresh/restart. | MEDIUM | Local server + SQLite. |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Centered "now" marker | Makes the app feel like a living schedule, not a static checklist. | MEDIUM | Needs stable layout and date window calculation. |
| Tablet-first dense UI | Fits the actual always-on household use case. | MEDIUM | Large tap targets, readable rows, no landing page. |
| One-alert overdue model | Reduces guilt/clutter when multiple recurrences were missed. | LOW | Store confirmations, derive overdue state from last confirmed watering. |
| Kiosk-friendly main screen | Can stay open in kitchen/living room. | LOW | Avoid navigation-heavy flows. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Accounts/login | Feels "complete" for web apps. | Adds friction and no value for a local home tool. | No auth in v1. |
| Cloud sync | Looks convenient. | Adds hosting, privacy, and reliability dependency. | Local network server. |
| Full calendar view | Familiar scheduling metaphor. | Hides the plant-row timeline concept. | Custom timeline table. |
| Every missed occurrence as a separate task | Seems accurate. | Creates noisy rows and discouraging backlog. | One overdue alert per plant. |
| Hour precision | Feels precise. | Plant watering rarely needs it and it hurts readability. | Day cells. |

## Feature Dependencies

```text
Plant model
    -> Add plant
    -> Plant photo
    -> Recurrence
         -> Future cells
         -> Overdue alert
              -> Confirm watering

Local server + SQLite
    -> Persistent plants
    -> Persistent confirmations
    -> Photo storage

Timeline layout
    -> Centered now marker
    -> Future cells
    -> Overdue alert placement
```

### Dependency Notes

- **Timeline requires plant and recurrence data:** The UI can only render meaningful rows once plants and schedule rules exist.
- **Overdue requires confirmation history:** Late status should be derived from last confirmed watering, not just a static scheduled cell.
- **Photo upload requires server storage:** Browser-only image blobs would make persistence fragile.

## MVP Definition

### Launch With (v1)

- [ ] Plant list with name and photo - needed to recognize plants.
- [ ] Add plant flow - needed to populate the app.
- [ ] Watering recurrence per plant - needed for scheduling.
- [ ] Day timeline with centered current marker - core interface.
- [ ] Future green watering cells - shows what is coming.
- [ ] One yellow overdue alert per late plant - shows what needs action.
- [ ] Tap-to-confirm watering - core household loop.
- [ ] Local server persistence - prevents data loss.

### Add After Validation (v1.x)

- [ ] Edit/delete plant - useful once initial add flow exists.
- [ ] Reorder plants - useful for matching physical room order.
- [ ] Manual "water now" action before overdue - helpful for early watering.
- [ ] Photo replacement - needed when a photo is bad or plant changes.

### Future Consideration (v2+)

- [ ] Multiple recurrence types such as weekly weekdays or seasonal rules - defer until every-N-days proves insufficient.
- [ ] Backup/export - useful for reliability but not required to validate the core loop.
- [ ] Multi-device live updates - only if several devices use the app at once.
- [ ] Plant care notes - useful, but secondary to watering.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Timeline table | HIGH | HIGH | P1 |
| Current date marker | HIGH | MEDIUM | P1 |
| Add plant | HIGH | LOW | P1 |
| Plant photo | HIGH | MEDIUM | P1 |
| Recurrence | HIGH | MEDIUM | P1 |
| Future cells | HIGH | MEDIUM | P1 |
| Overdue alert | HIGH | MEDIUM | P1 |
| Confirm watering | HIGH | MEDIUM | P1 |
| Edit/delete plant | MEDIUM | LOW | P2 |
| Export/backup | MEDIUM | MEDIUM | P3 |

## Competitor Feature Analysis

This project is not trying to compete with cloud plant-care apps. The relevant comparison is the user's current behavior: memory, notes, calendar reminders, or generic todo lists.

| Feature | Generic Todo | Calendar Reminder | Our Approach |
|---------|--------------|-------------------|--------------|
| Plant identity | Text only | Event title | Photo + name per row. |
| Future schedule | List or notifications | Calendar events | Inline green cells on plant row. |
| Overdue state | Backlog tasks | Missed notifications | One yellow row alert. |
| Household tablet | Not optimized | Not optimized | Main screen built for always-on tablet use. |

## Sources

- Project questioning and `.planning/PROJECT.md` - primary product intent.
- `/reactjs/react.dev` via Context7 - interactive list/component patterns.
- `/date-fns/date-fns` via Context7 - date arithmetic for recurrence.
- `/fastify/fastify-multipart` via Context7 - image upload feasibility.

---
*Feature research for: LaPlante*
*Researched: 2026-05-03*
