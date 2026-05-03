# Stack Research

**Domain:** local tablet web app with small home-network server
**Researched:** 2026-05-03
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| TypeScript | 6.0.3 | Shared language for client and server | Keeps recurrence, date, API, and database shapes explicit without adding a large framework. |
| React | 19.2.5 | Interactive tablet UI | Fits a stateful timeline interface with rows, cells, dialogs, and tap interactions. |
| Vite | 8.0.10 | Frontend dev/build tool | Official Vite docs support fast dev server, production build, and local preview scripts. |
| Fastify | 5.8.5 | Local HTTP API server | Small Node server with routes, plugins, schema validation, and good TypeScript support. |
| SQLite | 3.x runtime via Node driver | Local persistent data store | Perfect scale for household data; simple backup story and no external service dependency. |
| Drizzle ORM | 0.45.2 | Typed SQLite schema and queries | Official docs support SQLite schema declarations, inferred TypeScript types, and migrations. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.1.0 | Day-based recurrence calculations | Use for addDays, startOfDay, differenceInDays, and date comparison logic. |
| @fastify/multipart | 10.0.0 | Plant photo upload | Use for streaming uploaded images to disk with size limits. |
| lucide-react | latest at implementation | Icons | Use for add, check, calendar, image, settings, and toolbar icons. |
| zod or JSON Schema | latest at implementation | API validation | Use at API boundaries if Fastify route schemas are not enough. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| npm workspaces | Client/server organization | Keep `apps/web` and `apps/server` in one repo if implementation grows past one package. |
| ESLint | Static checks | Start from Vite/TypeScript defaults; avoid custom rules until useful. |
| Vitest | Unit tests | Best fit for date recurrence and derived timeline tests. |
| Playwright | Browser verification | Use later for tablet viewport checks and overdue tap flow. |

## Installation

```bash
# Core
npm install react react-dom fastify drizzle-orm date-fns @fastify/multipart

# Dev dependencies
npm install -D vite typescript vitest eslint @types/node
```

Exact SQLite driver should be chosen during implementation after checking machine constraints:
- `better-sqlite3` if native install works cleanly.
- `sqlite3` or another supported driver if native build friction appears.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| React + Vite | SvelteKit | If the project wants a more integrated full-stack framework and less custom wiring. |
| Fastify | Express | If existing code or familiarity strongly favors Express; otherwise Fastify gives cleaner schemas/plugins. |
| SQLite + Drizzle | JSON file | Only for a throwaway prototype; photos, confirmations, and recurrence history fit SQL better. |
| Browser app | Native tablet app | Only if browser kiosk usage becomes impossible or hardware integrations are needed. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Cloud-first backend | Adds accounts, hosting, and network dependency to a local household tool. | Local Fastify + SQLite server. |
| Browser-only localStorage | Data is tied to one browser profile and harder to back up or share. | Local server persistence. |
| Calendar-heavy UI library as the main view | The desired interface is a custom row timeline, not a generic calendar grid. | Build a focused timeline component. |
| Real-time stack for v1 | The tablet is the primary surface; polling or refetch-on-action is enough at first. | Simple REST API, add live updates only if needed. |

## Stack Patterns by Variant

**If only one tablet ever uses the app:**
- Run the server and tablet browser on the same machine or home network.
- Keep auth out of v1.

**If multiple devices should view the same data later:**
- Keep REST API idempotent and add a refresh strategy.
- Consider light LAN auth only when there is a real household need.

**If photo uploads become annoying on tablet:**
- Add image resizing/compression before upload.
- Keep original storage simple: files on disk, paths in SQLite.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| React 19.2.5 | Vite 8.0.10 | Use the official React plugin when scaffolding. |
| Fastify 5.8.5 | @fastify/multipart 10.0.0 | Multipart plugin supports Fastify upload streams and limits. |
| Drizzle ORM 0.45.2 | SQLite | Use SQLite-specific schema helpers from Drizzle. |
| TypeScript 6.0.3 | Vite/Fastify/Drizzle | Keep `strict` enabled for shared data types. |

## Sources

- `/vitejs/vite` via Context7 - Vite dev/build/preview scripts and TypeScript project guidance.
- `/reactjs/react.dev` via Context7 - component, local state, and interactive list patterns.
- `/fastify/fastify` via Context7 - TypeScript server, routes, plugins, and schema validation.
- `/fastify/fastify-multipart` via Context7 - streaming single-file uploads and size limits.
- `/drizzle-team/drizzle-orm-docs` via Context7 - SQLite schema declarations and inferred types.
- `/date-fns/date-fns` via Context7 - addDays, startOfDay, differenceInDays, and date comparison helpers.
- npm registry on 2026-05-03 - package versions listed above.

---
*Stack research for: LaPlante*
*Researched: 2026-05-03*
