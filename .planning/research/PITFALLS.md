# Pitfalls Research

**Domain:** local plant watering tracker
**Researched:** 2026-05-03
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Recurrence Drift

**What goes wrong:**
The next watering date shifts unpredictably after overdue confirmations, early watering, or daylight-saving changes.

**Why it happens:**
Date logic mixes exact timestamps with day-level expectations.

**How to avoid:**
Represent schedule decisions at day granularity. Normalize dates with start-of-day logic and unit-test recurrence functions.

**Warning signs:**
Tests pass for simple dates but fail around month boundaries, DST, or late confirmations.

**Phase to address:**
Phase 1 or first domain/model phase.

---

### Pitfall 2: Timeline Layout Jank

**What goes wrong:**
Rows jump, cells resize, or the current marker no longer aligns with day columns.

**Why it happens:**
The timeline is treated as normal flow layout instead of a fixed grid with stable dimensions.

**How to avoid:**
Define fixed day cell widths, stable row heights, and a dedicated now-marker overlay. Verify tablet viewport screenshots.

**Warning signs:**
Adding a plant photo or long name changes column alignment.

**Phase to address:**
Timeline UI phase.

---

### Pitfall 3: Photo Upload Fragility

**What goes wrong:**
Large photos slow the tablet, uploads fail silently, or files overwrite each other.

**Why it happens:**
Uploads are accepted without limits, safe filenames, or storage conventions.

**How to avoid:**
Use multipart size limits, generate unique filenames, store only paths in SQLite, and serve images from a controlled directory.

**Warning signs:**
Uploaded filenames are reused directly or photos are stored as database blobs in v1.

**Phase to address:**
Plant creation phase.

---

### Pitfall 4: Overdue Backlog Clutter

**What goes wrong:**
A neglected plant creates many yellow cells and the main table becomes noisy.

**Why it happens:**
The system models every missed recurrence as a separate required action.

**How to avoid:**
Store watering confirmations and derive one overdue state per plant.

**Warning signs:**
Database schema has a `scheduled_tasks` table with one row for every future/past occurrence.

**Phase to address:**
Recurrence and watering confirmation phase.

---

### Pitfall 5: Local Server Assumptions

**What goes wrong:**
The app works on the developer machine but not from the tablet.

**Why it happens:**
Server binds only to localhost, CORS/static hosting is unclear, or URLs are hardcoded.

**How to avoid:**
Plan local-network access explicitly. Bind to the correct host in dev/deploy instructions and test from another device or simulated network URL.

**Warning signs:**
Everything is tested only at `localhost` from the same machine.

**Phase to address:**
Server foundation phase.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store dates as display strings | Fast prototype | Hard comparisons and recurrence bugs | Never for persisted dates. |
| Put recurrence logic in React components | Quick UI demo | Hard to test and reuse server-side | Prototype only, then extract. |
| Store images in SQLite blobs | One backup file | DB grows fast and image serving is awkward | Avoid for v1. |
| Hardcode visible timeline range everywhere | Fast layout | Painful to tune for tablet | Only in first sketch; centralize quickly. |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Fastify multipart | Not consuming file streams | Always consume stream and handle truncation/size limits. |
| SQLite migrations | Editing schema without migration path | Use Drizzle migrations from the start. |
| Browser to LAN server | Hardcoded localhost in client | Use relative API paths when serving web from server, or configurable API base. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Rendering too many days | Tablet scroll/render feels sluggish | Render a bounded window around today | Around many plants x many days. |
| Large original photos | Slow load and huge backups | Limit upload size, resize later if needed | After several high-res photos. |
| Recomputing all schedules on every render | Laggy UI | Memoize derived timeline view model | With many rows or frequent state changes. |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Serving arbitrary upload paths | Local file exposure | Store photos in controlled directory and generate filenames. |
| No upload size limit | Disk fill or memory pressure | Enforce multipart file limits. |
| Binding server publicly by accident | LAN app exposed beyond intended network | Document bind host and avoid internet exposure. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Generic dashboard first | User cannot instantly see watering needs | Make timeline table the first screen. |
| Tiny tap targets | Tablet use becomes frustrating | Use large row actions and clear alert cells. |
| Too much schedule detail | The row becomes hard to scan | Day cells + one overdue alert. |
| Photo crops inconsistent | Plants are hard to recognize | Use stable image aspect ratio and fallback placeholder. |

## "Looks Done But Isn't" Checklist

- [ ] **Timeline:** Current marker remains centered and aligned across tablet widths.
- [ ] **Recurrence:** Late watering and future dates recalculate correctly.
- [ ] **Overdue alert:** Only one alert appears per plant, even after multiple missed cycles.
- [ ] **Photo upload:** Large files are rejected or handled cleanly.
- [ ] **Local access:** Tablet can load the app from the server host.
- [ ] **Persistence:** Restarting server/browser keeps plants and watering history.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Recurrence drift | MEDIUM | Extract pure recurrence service, add tests, migrate stored dates if needed. |
| Layout jank | MEDIUM | Freeze grid dimensions, separate row content from timeline columns. |
| Photo storage mess | MEDIUM | Move files to controlled directory, rewrite DB paths, add limits. |
| Server access failure | LOW | Adjust bind host, API base, and local deployment notes. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Recurrence drift | Domain model / persistence | Unit tests for due dates and overdue state. |
| Timeline layout jank | Timeline UI | Tablet viewport screenshot and alignment check. |
| Photo upload fragility | Plant creation | Upload tests for valid, oversized, and missing files. |
| Overdue backlog clutter | Watering confirmation | Multiple missed intervals still show one alert. |
| Local server assumptions | Server foundation | App loads from a LAN-style host, not only localhost. |

## Sources

- `/date-fns/date-fns` via Context7 - day arithmetic and comparison helpers.
- `/fastify/fastify-multipart` via Context7 - stream consumption and file upload size limits.
- `/drizzle-team/drizzle-orm-docs` via Context7 - schema and migration approach.
- Project requirements from `.planning/PROJECT.md`.

---
*Pitfalls research for: LaPlante*
*Researched: 2026-05-03*
