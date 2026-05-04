# Milestones

## v1.0 milestone (Shipped: 2026-05-04)

**Phases completed:** 4 phases, 10 plans, 12 tasks

**Key accomplishments:**

- React/Vite web app with CSS Grid timeline rendering 5 mock plants, sticky name column and date header, green/amber dot cells, and blue now-marker with time badge
- usePlants hook with 60s polling and mock-data fallback wired to Timeline, scroll-to-today centering via scrollIntoView on load and midnight crossover
- Multipart photo upload on POST /api/plants with UUID filenames, static serving via @fastify/static, and Vite dev proxy
- Complete add-plant modal with name/photo/recurrence fields, toast notifications, FAB button, clickable empty state, photo rendering in plant rows, and API client for multipart upload
- Tap-to-confirm watering on overdue cells with confirmWatering API client, rectangular 56x48 cells, and yellow-to-green CSS transition
- Tablet kiosk configuration (viewport zoom lock + Vite LAN host) and automated persistence smoke tests verifying data survives server restart

---
