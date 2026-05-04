---
phase: 03-plant-creation-and-photos
plan: 01
subsystem: api
tags: [fastify, multipart, @fastify/multipart, @fastify/static, file-upload, vite-proxy]

# Dependency graph
requires:
  - phase: 02-timeline-main-screen
    provides: POST /api/plants JSON endpoint, Fastify app structure, plant routes
provides:
  - Multipart file upload on POST /api/plants with UUID filenames
  - Static file serving at /photos/ from data/photos/
  - Vite dev proxy for /photos to backend
  - Configurable photosDir for testing and deployment
affects: [03-plant-creation-and-photos, 04-watering-confirmation-and-tablet-polish]

# Tech tracking
tech-stack:
  added: ["@fastify/multipart@10", "@fastify/static@9"]
  patterns: ["multipart-aware dual-content-type route handler", "UUID filename generation for photo storage", "configurable static serving directory"]

key-files:
  created: [data/photos/.gitkeep]
  modified: [apps/server/src/app.ts, apps/server/src/routes/plants.ts, apps/server/src/test/plants.routes.test.ts, apps/web/vite.config.ts, .gitignore]

key-decisions:
  - "Use request.parts() iterator with toBuffer() instead of pipeline streaming for multipart file handling (avoids inject stream hang)"
  - "Use writeFileSync over stream pipeline for photo file writes (simpler, works with inject testing)"
  - "Configurable photosDir via BuildAppOptions enables test isolation with temp directories"
  - "Static plugin root is configurable via photosDir option, not hardcoded to PHOTOS_DIR"

patterns-established:
  - "Dual content-type route handler: detect multipart via content-type header, fall back to JSON"
  - "Multipart field extraction: iterate request.parts(), collect fields and file data in single pass"
  - "Photo storage: UUID filename with original extension, stored as filename-only in database"

requirements-completed: [PLNT-01, PLNT-02, PLNT-03, PERS-03]

# Metrics
duration: 16min
completed: 2026-05-03
---

# Phase 3 Plan 01: Multipart Photo Upload Summary

**Multipart photo upload on POST /api/plants with UUID filenames, static serving via @fastify/static, and Vite dev proxy**

## Performance

- **Duration:** 16 min
- **Started:** 2026-05-03T19:59:42Z
- **Completed:** 2026-05-03T20:15:55Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- POST /api/plants accepts multipart/form-data with photo file uploads, storing photos with UUID filenames
- GET /photos/{filename} serves stored photo files with correct MIME type via @fastify/static
- Existing JSON-body POST /api/plants tests continue passing without modification (backward compatible)
- Photo directory auto-created on server startup, configurable for test isolation

## Task Commits

Each task was committed atomically:

1. **Task 1: Install plugins, register in app, add photos proxy** - `8eab6f4` (feat)
2. **Task 2: TDD multipart route handler** - `d94c8dc` (test - RED), `3971904` (feat - GREEN)

## Files Created/Modified
- `apps/server/src/app.ts` - Multipart + static plugin registration, configurable photosDir
- `apps/server/src/routes/plants.ts` - Dual content-type POST handler (JSON + multipart)
- `apps/server/src/test/plants.routes.test.ts` - 4 new multipart tests + helpers
- `apps/web/vite.config.ts` - Added /photos proxy to localhost:3000
- `.gitignore` - Added data/photos/* with .gitkeep exception
- `data/photos/.gitkeep` - Placeholder to track empty photos directory

## Decisions Made
- Used `request.parts()` iterator with `toBuffer()` instead of stream `pipeline` for multipart file handling -- stream pipeline hangs with Fastify inject in tests
- Used `writeFileSync` for photo file writes instead of streaming for simplicity and test reliability
- Made `photosDir` configurable via `BuildAppOptions` to enable test isolation with temp directories
- Static plugin root is also configurable via `photosDir` option, ensuring test files are served from the test directory

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed multipart fields API usage**
- **Found during:** Task 2 (multipart route implementation)
- **Issue:** Plan suggested `data.fields.find()` but @fastify/multipart v10 uses a dictionary (`MultipartFields`), not an array
- **Fix:** Switched from `request.file()` to `request.parts()` iterator approach, which handles both file and no-file cases uniformly
- **Files modified:** apps/server/src/routes/plants.ts
- **Verification:** All 13 tests pass
- **Committed in:** 3971904 (Task 2 GREEN commit)

**2. [Rule 1 - Bug] Fixed stream pipeline hanging with Fastify inject**
- **Found during:** Task 2 (multipart route implementation)
- **Issue:** `pipeline(filePart.file, createWriteStream(...))` hangs indefinitely when used with Fastify's `app.inject()` test utility
- **Fix:** Replaced stream pipeline with `part.toBuffer()` + `writeFileSync()` approach
- **Files modified:** apps/server/src/routes/plants.ts
- **Verification:** Tests complete in ~1 second instead of timing out at 5 seconds
- **Committed in:** 3971904 (Task 2 GREEN commit)

**3. [Rule 3 - Blocking] Made static plugin directory configurable for tests**
- **Found during:** Task 2 (test execution)
- **Issue:** Static plugin in app.ts was hardcoded to `PHOTOS_DIR`, but tests use a temp directory. Photo serving test got 404 because static served from wrong directory
- **Fix:** Made static plugin root configurable via `options.photosDir`, same as route handler
- **Files modified:** apps/server/src/app.ts
- **Verification:** Photo serving test passes (GET /photos/{filename} returns 200)
- **Committed in:** 3971904 (Task 2 GREEN commit)

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking)
**Impact on plan:** All deviations necessary for correctness and test reliability. The switch from streaming to buffer-based approach is equally correct for the expected file sizes (5MB limit). No scope creep.

## Issues Encountered
- @fastify/multipart v10 `request.file()` returns undefined when no file is present in multipart body, requiring a unified `parts()` iterator approach for both cases
- Fastify inject multipart streams don't properly signal end to `pipeline()`, causing hangs -- resolved by using `toBuffer()` instead

## Next Phase Readiness
- Photo upload endpoint ready for web client integration in plan 03-02
- Static serving working at /photos/ prefix
- Existing API fully backward compatible

---
*Phase: 03-plant-creation-and-photos*
*Completed: 2026-05-03*

## Self-Check: PASSED

- All 7 files verified to exist on disk
- All 3 commits verified in git history (8eab6f4, d94c8dc, 3971904)
- All 13 tests pass (9 existing + 4 new multipart)
- TypeScript compiles cleanly
