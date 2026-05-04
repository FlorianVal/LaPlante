# Phase 3: Plant Creation and Photos - Research

**Researched:** 2026-05-03
**Domain:** File upload, modal UI, photo storage/serving, React state refresh
**Confidence:** HIGH

## Summary

Phase 3 adds the plant creation flow: a modal form triggered from the timeline, a file upload endpoint on the Fastify server, photo storage on disk with paths in SQLite, and a photo-serving endpoint. The existing codebase already has significant foundation for this -- the `PlantResponse` type includes `photoPath`, the SQLite schema has a `photo_path` column, and `POST /api/plants` accepts `photoPath` in its Zod schema. The main work is (1) modifying the create-plant endpoint to accept multipart form data with file upload, (2) adding a static file serving route for stored photos, (3) building the React modal form with photo preview and recurrence presets, and (4) wiring the creation flow into the existing `usePlants` polling hook.

**Primary recommendation:** Use `@fastify/multipart` with `attachFieldsToBody: true` for clean field+file handling, pipe the uploaded file to `data/photos/{uuid}.{ext}` on disk, serve photos via `@fastify/static` on a `/photos/` prefix, and build the modal as a controlled React component with `useState` for form state. No new external dependencies on the web side.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** The add-plant form opens as a centered modal over the timeline -- no navigation to a separate page.
- **D-02:** A fixed "+" button is always visible on the timeline (e.g., top-right corner) to trigger the modal, regardless of whether plants already exist.
- **D-03:** The EmptyState component can also trigger the modal as a secondary entry point, but the fixed "+" button is the primary trigger.
- **D-04:** The form has 3 fields in this order: plant name (required text input), photo (optional file selector with preview), recurrence interval (required, defaults to 7 days).
- **D-05:** The `lastWateredOn` field is not exposed to the user -- it defaults to today via the existing server behavior.
- **D-06:** The user selects a photo via standard file picker (input[type=file]). No camera capture in v1.
- **D-07:** The selected photo shows a preview in the modal before submission.
- **D-08:** Photo files are stored on disk (server-side) and the file path is saved in `plants.photo_path` in SQLite.
- **D-09:** The server needs a new multipart upload endpoint or the existing `POST /api/plants` must accept multipart form data.
- **D-10:** The recurrence field presents quick-select presets (3 days, 7 days, 14 days) alongside a custom numeric input for arbitrary intervals.
- **D-11:** The default selection is 7 days (most common for house plants).
- **D-12:** After successful creation, the modal closes and a discreet toast notification confirms the plant was added.
- **D-13:** The plant list refreshes immediately (bypass the 60s polling) so the new row appears instantly.
- **D-14:** The new plant's photo replaces the placeholder `<Flower2>` icon on its timeline row.

### Claude's Discretion
- Exact modal styling and dimensions (should use existing design tokens).
- Toast component implementation and position.
- File size limits and accepted image formats.
- Photo storage directory path and file naming convention.
- Error states for the form (network failure, invalid file, server error).
- How the "+" button integrates into the existing Timeline layout.

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PLNT-01 | User can add a plant with a required name | Modal form with name input, multipart POST to server, existing `createPlantWithRecurrence` query |
| PLNT-02 | User can attach a photo when adding a plant | `@fastify/multipart` for file upload, `pipeline()` to save to disk, `photo_path` column already in schema |
| PLNT-03 | User can define a day-based watering recurrence for each plant | Preset buttons (3/7/14 days) + custom numeric input, `intervalDays` already in Zod schema and DB |
| PLNT-04 | Newly added plants appear as new rows in the main timeline | Immediate `usePlants.refresh()` call after creation bypasses 60s polling |
| PERS-03 | Plant photos remain available after browser refresh and server restart | Photos on disk in `data/photos/`, paths in SQLite, served via `@fastify/static` on `/photos/` prefix |
</phase_requirements>

## Standard Stack

### Core (server-side, NEW)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @fastify/multipart | 10.0.0 | Parse multipart form data with file upload | Official Fastify ecosystem plugin, handles streaming, limits, and field extraction |
| @fastify/static | 9.1.3 | Serve stored photo files from disk | Official Fastify plugin, handles MIME types, caching, and 404s |

### Existing (no new installs needed)

| Library | Version | Purpose | Usage in Phase |
|---------|---------|---------|----------------|
| fastify | ^5.6.1 | HTTP server | Register multipart + static plugins |
| zod | ^4.1.12 | API validation | Validate multipart fields after extraction |
| react | ^19.1.0 | UI framework | Modal, form, toast components |
| lucide-react | ^0.511.0 | Icons | Plus icon for the "+" button |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @fastify/static for photos | Custom GET route with `reply.sendFile()` | Custom route gives more control but reimplements MIME detection, caching, and streaming. Overkill for this use case. |
| @fastify/multipart `attachFieldsToBody: true` | Manual `req.parts()` iteration | `attachFieldsToBody` gives structured `req.body` with `.value` on fields and `.toBuffer()` on files. Less code, same result. |
| Base64 image encoding | File upload + disk storage | Base64 would bloat SQLite, not scale for multiple photos, and can't be cached by browser. File on disk is correct. |

**Installation:**
```bash
cd apps/server && npm install @fastify/multipart@10 @fastify/static@9
```

**Version verification:**
- `@fastify/multipart@10.0.0` (verified 2026-05-03 via npm registry)
- `@fastify/static@9.1.3` (verified 2026-05-03 via npm registry)
- Both compatible with Fastify 5.x (fastify-plugin wrapping, no peer dependency conflicts)

## Architecture Patterns

### Recommended Project Structure (additions only)

```
apps/server/
  src/
    routes/
      plants.ts          # MODIFY: update POST handler for multipart
    uploads.ts           # NEW: photo upload logic (save to disk, generate filename)
    app.ts               # MODIFY: register multipart + static plugins
data/
  photos/                # NEW: photo storage directory
apps/web/src/
  components/
    AddPlantModal/
      AddPlantModal.tsx      # NEW: modal form component
      AddPlantModal.module.css
    Toast/
      Toast.tsx               # NEW: toast notification component
      Toast.module.css
    PlantRow/
      PlantRow.tsx            # MODIFY: render photo when photoPath exists
  hooks/
    usePlants.ts              # MODIFY: expose refresh function
  lib/
    api.ts                    # MODIFY: add createPlant with FormData
```

### Pattern 1: Multipart Upload with @fastify/multipart

**What:** Accept file + fields in a single multipart POST request
**When to use:** The add-plant form sends name, intervalDays, and photo file together

**Example:**
```typescript
// Source: @fastify/multipart GitHub README
// Register at app level:
import multipart from '@fastify/multipart';
app.register(multipart, {
  limits: {
    fileSize: 5_000_000,  // 5 MB
    files: 1,
    fields: 5
  }
});

// In the route handler:
app.post('/api/plants', async (request, reply) => {
  const data = await request.file();
  // data.file      — readable stream
  // data.fields    — other form fields (accessible as array)
  // data.filename  — original filename
  // data.mimetype  — e.g. 'image/jpeg'
  
  // Extract text fields from data.fields
  const nameField = data.fields.find(f => f.fieldname === 'name');
  const intervalField = data.fields.find(f => f.fieldname === 'intervalDays');
  
  // Save file to disk
  const { pipeline } = await import('node:stream/promises');
  const { randomUUID } = await import('node:crypto');
  const ext = data.filename.split('.').pop();
  const safeName = `${randomUUID()}.${ext}`;
  const filePath = path.join(PHOTOS_DIR, safeName);
  await pipeline(data.file, fs.createWriteStream(filePath));
  
  // Create plant with photoPath
  // ...
});
```

**Important note from docs:** Busboy processes multipart parts in serial order. Place text fields BEFORE the file field in the FormData, OR read `data.fields` AFTER consuming the file stream. For this project, we control the frontend, so we can send fields first.

### Pattern 2: Static Photo Serving with @fastify/static

**What:** Serve uploaded photos from a dedicated directory
**When to use:** The browser needs to load plant photos via `<img src="/photos/{uuid}.jpg">`

**Example:**
```typescript
// Source: @fastify/static GitHub README
import fastifyStatic from '@fastify/static';

app.register(fastifyStatic, {
  root: path.resolve('data/photos'),  // absolute path required
  prefix: '/photos/',
  serveDotFiles: false,
  // No wildcard needed — let the default serve work
});
```

**Important:** Register this BEFORE or AFTER API routes depending on prefix overlap. Since `/photos/` doesn't conflict with `/api/`, order doesn't matter. But register it in `app.ts` alongside other plugins.

### Pattern 3: React Modal with Controlled Form State

**What:** Single-modal form with `useState` for each field
**When to use:** The add-plant modal with name, photo preview, and recurrence selection

**Example:**
```typescript
// Pattern consistent with existing codebase (CSS Modules, lucide-react)
function AddPlantModal({ onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [intervalDays, setIntervalDays] = useState(7);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('intervalDays', String(intervalDays));
    if (photoFile) formData.append('photo', photoFile);
    await onSubmit(formData);
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => { if (photoPreview) URL.revokeObjectURL(photoPreview); };
  }, [photoPreview]);
}
```

### Pattern 4: Immediate Refresh After Mutation

**What:** Trigger a data refetch bypassing the polling interval
**When to use:** After plant creation, show the new row immediately

**Example:**
```typescript
// In usePlants.ts — already has `retry: fetchPlantsData` as the refresh function
// Just expose it with a better name and ensure it's stable
export function usePlants() {
  // ... existing code ...
  return { plants, loading, error, retry: fetchPlantsData, refresh: fetchPlantsData };
}

// In the component:
const { plants, loading, error, retry, refresh } = usePlants();

const handleCreatePlant = async (formData: FormData) => {
  await createPlant(formData);
  await refresh();  // immediate refresh, don't wait for polling
  closeModal();
};
```

### Anti-Patterns to Avoid

- **Storing images as base64 in SQLite:** Blobs the database, no browser caching, slow for multiple plants. Store path strings, serve files from disk.
- **Using the original filename on disk:** Security risk (path traversal, name collisions, special characters). Always generate a UUID-based filename.
- **Not consuming the upload stream:** If `data.file` is not piped or consumed, the promise never resolves and the request hangs.
- **Forgetting to revoke `URL.createObjectURL`:** Memory leak. Always revoke on component unmount.
- **Adding a separate upload endpoint + separate create endpoint:** Unnecessary complexity. One multipart POST that handles both file and fields.
- **Using a third-party modal library:** The existing codebase uses plain React + CSS Modules. A portal-based modal with CSS Modules is simpler and consistent.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multipart form parsing | Manual boundary parsing, body-parser hacks | `@fastify/multipart` | Handles streaming, limits, multipart spec edge cases, file truncation detection |
| Static file serving | Custom route with `fs.readFile` + manual MIME detection | `@fastify/static` | Handles range requests, caching headers, ETags, MIME types, 404s |
| Safe filename generation | Sanitization regexes on user-provided names | `crypto.randomUUID()` + extension extraction | UUID eliminates collisions, injection, and encoding issues |
| Image preview in browser | Upload to server first, get URL back | `URL.createObjectURL(file)` | Client-side preview without server round-trip |

**Key insight:** File upload is a solved problem with well-tested libraries. Custom implementations almost always miss edge cases (truncated files, MIME spoofing, concurrent writes, stream cleanup).

## Common Pitfalls

### Pitfall 1: Multipart Field Order
**What goes wrong:** Text fields appear empty when read before file stream is consumed
**Why it happens:** Busboy processes parts serially. If the file comes first in the multipart stream, text fields after it aren't available until the file stream finishes.
**How to avoid:** In the frontend `FormData`, append text fields BEFORE the file field. Or in the backend, read `data.fields` after consuming the file stream.
**Warning signs:** `data.fields` returns partial or empty field values.

### Pitfall 2: Photo Directory Doesn't Exist at Startup
**What goes wrong:** Server crashes when trying to save the first uploaded photo
**Why it happens:** `data/photos/` is not in git (and shouldn't be), so a fresh clone has no photo directory.
**How to avoid:** Create the directory on server startup with `fs.mkdirSync(path, { recursive: true })` before registering the static plugin. Add `data/photos/` to `.gitignore` with a `.gitkeep`.
**Warning signs:** `ENOENT` error on first photo upload.

### Pitfall 3: Vite Proxy Doesn't Cover Photo URLs
**What goes wrong:** In dev mode, photos fail to load because the Vite dev server proxy only covers `/api`
**Why it happens:** Photo URLs like `/photos/abc.jpg` bypass the proxy and hit the Vite dev server (which returns 404).
**How to avoid:** Add a second proxy entry in `vite.config.ts` for `/photos` pointing to the Fastify server.
**Warning signs:** Photos load in production build but not in dev mode.

### Pitfall 4: Memory Leak from Object URLs
**What goes wrong:** Browser memory grows each time a photo preview is shown in the modal
**Why it happens:** `URL.createObjectURL()` creates a blob URL that persists until explicitly revoked.
**How to avoid:** Revoke the URL in a `useEffect` cleanup function when the component unmounts or when the file selection changes.
**Warning signs:** Memory usage grows in dev tools after opening/closing the modal multiple times.

### Pitfall 5: No File Size Limit
**What goes wrong:** A user uploads a 50 MB photo, consuming disk space and slow to serve to tablet
**Why it happens:** Default `@fastify/multipart` file size limit is 1 MB, which is too restrictive for photos. But no limit means unlimited disk consumption.
**How to avoid:** Set a reasonable limit (e.g., 5 MB) in the multipart plugin config. Check `data.file.truncated` after saving and delete the partial file if limit was exceeded.
**Warning signs:** Server disk fills up, tablet takes long to load plant rows.

### Pitfall 6: MIME Type Validation Bypass
**What goes wrong:** A malicious file disguised with an image extension is uploaded
**Why it happens:** `data.mimetype` comes from the client and can be spoofed.
**How to avoid:** Validate both the extension AND the MIME type against an allowlist: `['image/jpeg', 'image/png', 'image/webp', 'image/gif']`. Optionally check file header bytes.
**Warning signs:** Non-image files stored in the photo directory.

## Code Examples

### Server: Register Multipart + Static in app.ts

```typescript
// Source: @fastify/multipart + @fastify/static official docs
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const PHOTOS_DIR = path.resolve('data/photos');

// Ensure photo directory exists
mkdirSync(PHOTOS_DIR, { recursive: true });

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: true });

  // ... existing DB setup ...

  // Register multipart with upload limits
  app.register(multipart, {
    limits: {
      fileSize: 5_000_000,  // 5 MB per file
      files: 1,              // one file per request
      fields: 5              // up to 5 text fields
    }
  });

  // Serve uploaded photos
  app.register(fastifyStatic, {
    root: PHOTOS_DIR,
    prefix: '/photos/',
    serveDotFiles: false
  });

  // ... existing route registrations ...

  return app;
}
```

### Server: Modified POST /api/plants with Multipart

```typescript
// Key change: detect content type and parse accordingly
app.post('/api/plants', async (request, reply) => {
  const window = parseWindow(request.query);
  if (!window.ok) {
    return reply.code(400).send({ error: window.error });
  }

  let name: string;
  let intervalDays: number;
  let photoPath: string | null = null;

  // Handle multipart/form-data
  const data = await request.file();
  if (!data) {
    return reply.code(400).send({ error: 'No form data' });
  }

  // Extract text fields
  const nameField = data.fields.find(f => f.fieldname === 'name');
  const intervalField = data.fields.find(f => f.fieldname === 'intervalDays');

  name = nameField?.value ?? '';
  intervalDays = Number(intervalField?.value ?? '7');

  // Validate with Zod (same schema, different parsing)
  const parsed = createPlantSchema.safeParse({
    name,
    intervalDays
  });
  if (!parsed.success) {
    return reply.code(400).send({ error: 'Invalid plant input' });
  }

  // Process file if present
  if (data.mimetype && data.mimetype.startsWith('image/')) {
    const ext = data.filename?.split('.').pop() ?? 'jpg';
    const safeName = `${randomUUID()}.${ext}`;
    const filePath = path.join(PHOTOS_DIR, safeName);

    const { pipeline } = await import('node:stream/promises');
    await pipeline(data.file, createWriteStream(filePath));

    if (data.file.truncated) {
      // File exceeded size limit — clean up
      await unlink(filePath);
      return reply.code(413).send({ error: 'File too large' });
    }

    photoPath = safeName;
  } else {
    // Consume the stream even if not saving (prevents hang)
    await data.toBuffer();
  }

  const plant = plantService.createPlant(
    { ...parsed.data, photoPath },
    window.value
  );
  return reply.code(201).send(plant);
});
```

### Web: Vite Proxy for Photos

```typescript
// vite.config.ts — add second proxy entry
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/photos': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
```

### Web: API Client — createPlant with FormData

```typescript
// lib/api.ts
export async function createPlant(formData: FormData): Promise<PlantResponse> {
  const res = await fetch(`${API_BASE}/plants`, {
    method: 'POST',
    body: formData,  // Let browser set Content-Type with boundary
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

### Web: PlantRow Photo Rendering

```typescript
// PlantRow.tsx — conditionally render photo or placeholder icon
const iconContent = plant.photoPath ? (
  <img
    src={`/photos/${plant.photoPath}`}
    alt={plant.name}
    className={styles.plantPhoto}
  />
) : (
  <Flower2 size={20} />
);

// In the CSS module, add:
// .plantPhoto {
//   width: var(--icon-placeholder-size);
//   height: var(--icon-placeholder-size);
//   border-radius: var(--space-xs);
//   object-fit: cover;
// }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@fastify/multipart` v6 (deprecated `fastify-multipart`) | `@fastify/multipart` v10 with Fastify 5 | Fastify 5 release | Old package name deprecated, must use scoped package |
| `busboy` limits thrown silently | `throwFileSizeLimit` option (default true since v4) | @fastify/multipart v4 | File size limit now throws `RequestFileTooLargeError` by default instead of silently truncating |
| Manual `req.parts()` iteration | `attachFieldsToBody` for structured access | @fastify/multipart v4+ | Fields accessible on `req.body` like regular JSON body |

**Deprecated/outdated:**
- `fastify-multipart` (unscoped): Deprecated. Use `@fastify/multipart`.
- `@fastify/static` v7 and below: For Fastify 3/4. Must use v8+ for Fastify 5 (current is v9).

## Open Questions

1. **Photo path stored as filename only vs. full path?**
   - What we know: The schema stores `photo_path` as a text column. The current server stores absolute paths? No -- the `createPlantSchema` accepts `photoPath: z.string().nullable().optional()` and the service passes it through.
   - Recommendation: Store only the filename (e.g., `uuid.jpg`) in `photo_path`. The server knows the `PHOTOS_DIR` and the static plugin serves from there. The frontend constructs the URL as `/photos/{filename}`. This avoids hardcoding absolute paths that break on server migration.
   - Confidence: HIGH

2. **Should the existing JSON POST /api/plants still work alongside multipart?**
   - What we know: The tests in `plants.routes.test.ts` use JSON body. If we switch to multipart-only, existing tests break.
   - Recommendation: Support both content types. Check `request.headers['content-type']` — if it starts with `multipart/form-data`, use multipart parsing; otherwise, use the existing JSON body parsing. This preserves test compatibility.
   - Confidence: MEDIUM -- planner should decide the strategy (dual content type vs. migrate tests).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Server + build | Yes | 25.1.0 | -- |
| npm | Package install | Yes | 11.6.2 | -- |
| data/ directory | SQLite DB | Yes | -- (36KB sqlite file exists) | -- |
| data/photos/ directory | Photo storage | No (needs creation) | -- | Auto-create on server startup |

**Missing dependencies with no fallback:**
- None blocking -- new npm packages can be installed, photo directory auto-created.

**Missing dependencies with fallback:**
- `data/photos/` will be auto-created at server startup with `mkdirSync({ recursive: true })`.

## Sources

### Primary (HIGH confidence)
- @fastify/multipart GitHub README -- multipart API, `req.file()`, limits, field ordering, `attachFieldsToBody`
- @fastify/static GitHub README -- registration options, root/prefix, serving files
- Project source code -- all canonical files read and analyzed (app.ts, plants.ts, schema.ts, queries.ts, types.ts, api.ts, usePlants.ts, PlantRow.tsx, Timeline.tsx, vite.config.ts, tokens.css)
- npm registry -- verified versions: @fastify/multipart@10.0.0, @fastify/static@9.1.3

### Secondary (MEDIUM confidence)
- Fastify V5 Migration Guide -- confirmed compatibility patterns
- BetterStack File Uploads with Fastify tutorial -- confirmed multipart patterns align with official docs

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- verified versions and compatibility against npm registry and official docs
- Architecture: HIGH -- all integration points read from actual source code, patterns verified against library docs
- Pitfalls: HIGH -- drawn from official docs warnings and established file upload patterns

**Research date:** 2026-05-03
**Valid until:** 2026-06-03 (stable libraries, no rapid changes expected)
