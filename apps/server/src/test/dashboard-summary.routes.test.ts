import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { FastifyInstance } from "fastify";
import { expect, it } from "vitest";

import { buildApp } from "../app.js";

it("returns only overdue count and latest watering", async () => {
  const { app, cleanup } = createTestApp({ today: "2026-05-20" });
  await createPlant(app, "Monstera", 7, "2026-05-01");
  await createPlant(app, "Menthe", 30, "2026-05-18");

  const response = await app.inject({
    method: "GET",
    url: "/api/dashboard-summary"
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    overdueCount: 1,
    lastWateredOn: "2026-05-18"
  });
  await app.close();
  cleanup();
});

function createTestApp(options: { today: string }) {
  const dir = mkdtempSync(join(tmpdir(), "laplante-dashboard-summary-"));

  return {
    app: buildApp({
      databasePath: join(dir, "laplante.sqlite"),
      today: options.today
    }),
    cleanup: () => rmSync(dir, { recursive: true, force: true })
  };
}

async function createPlant(
  app: FastifyInstance,
  name: string,
  intervalDays: number,
  lastWateredOn: string
): Promise<void> {
  const response = await app.inject({
    method: "POST",
    url: "/api/plants?from=2026-05-20&to=2026-05-20",
    payload: { name, intervalDays, lastWateredOn }
  });

  expect(response.statusCode).toBe(201);
}
