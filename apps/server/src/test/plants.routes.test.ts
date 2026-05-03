import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildApp } from "../app.js";
import { createDatabase } from "../db/client.js";

const WINDOW = "from=2026-05-03&to=2026-05-31";

describe("plant routes", () => {
  it("creates and lists plants with derived schedule summaries", async () => {
    const { app, cleanup } = createTestApp();

    const created = await app.inject({
      method: "POST",
      url: `/api/plants?${WINDOW}`,
      payload: {
        name: "Monstera",
        intervalDays: 7,
        lastWateredOn: "2026-05-01"
      }
    });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({
      name: "Monstera",
      recurrence: { intervalDays: 7 },
      schedule: { nextDueDate: "2026-05-08" }
    });

    const listed = await app.inject({
      method: "GET",
      url: `/api/plants?${WINDOW}`
    });

    expect(listed.statusCode).toBe(200);
    expect(listed.json()[0].schedule.futureWateringDates).toContain(
      "2026-05-08"
    );

    await app.close();
    cleanup();
  });

  it("defaults omitted lastWateredOn to today", async () => {
    const { app, cleanup } = createTestApp();

    const created = await app.inject({
      method: "POST",
      url: `/api/plants?${WINDOW}`,
      payload: { name: "Ficus", intervalDays: 7 }
    });

    expect(created.statusCode).toBe(201);
    expect(created.json().schedule.nextDueDate).toBe("2026-05-10");

    await app.close();
    cleanup();
  });

  it("POST /api/plants/:id/waterings recalculates from actual wateredOn", async () => {
    const { app, cleanup } = createTestApp();

    const created = await app.inject({
      method: "POST",
      url: `/api/plants?${WINDOW}`,
      payload: {
        name: "Monstera",
        intervalDays: 7,
        lastWateredOn: "2026-05-01"
      }
    });
    const plantId = created.json().id;

    const watered = await app.inject({
      method: "POST",
      url: `/api/plants/${plantId}/waterings?${WINDOW}`,
      payload: { wateredOn: "2026-05-10" }
    });

    expect(watered.statusCode).toBe(200);
    expect(watered.json().schedule.nextDueDate).toBe("2026-05-17");
    expect(watered.json().schedule.futureWateringDates).toContain("2026-05-17");

    await app.close();
    cleanup();
  });

  it("returns one overdue state without a backlog array for multiple misses", async () => {
    const { app, cleanup } = createTestApp();

    const created = await app.inject({
      method: "POST",
      url: `/api/plants?${WINDOW}`,
      payload: {
        name: "Pothos",
        intervalDays: 7,
        lastWateredOn: "2026-04-01"
      }
    });

    expect(created.statusCode).toBe(201);
    expect(created.json().schedule).toMatchObject({
      isOverdue: true,
      overdueSince: "2026-04-08"
    });
    expect(created.json().schedule.futureWateringDates).not.toContain(
      "2026-04-15"
    );

    await app.close();
    cleanup();
  });

  it("returns persisted plant data after reopening the database", async () => {
    const { databasePath, cleanup } = createTempDatabasePath();
    applySchemaFile(databasePath);

    const firstApp = buildApp({ databasePath, today: "2026-05-03" });
    const created = await firstApp.inject({
      method: "POST",
      url: `/api/plants?${WINDOW}`,
      payload: {
        name: "Monstera",
        intervalDays: 7,
        lastWateredOn: "2026-05-01"
      }
    });
    const plantId = created.json().id;

    await firstApp.inject({
      method: "POST",
      url: `/api/plants/${plantId}/waterings?${WINDOW}`,
      payload: { wateredOn: "2026-05-10" }
    });
    await firstApp.close();

    const reopened = buildApp({ databasePath, today: "2026-05-10" });
    const listed = await reopened.inject({
      method: "GET",
      url: `/api/plants?${WINDOW}`
    });

    expect(listed.statusCode).toBe(200);
    expect(listed.json()[0]).toMatchObject({
      name: "Monstera",
      schedule: { nextDueDate: "2026-05-17" }
    });

    await reopened.close();
    cleanup();
  });
});

function createTestApp() {
  const { databasePath, cleanup } = createTempDatabasePath();
  applySchemaFile(databasePath);

  return {
    app: buildApp({ databasePath, today: "2026-05-03" }),
    cleanup
  };
}

function createTempDatabasePath(): {
  databasePath: string;
  cleanup: () => void;
} {
  const dir = mkdtempSync(join(tmpdir(), "laplante-routes-"));

  return {
    databasePath: join(dir, "laplante.sqlite"),
    cleanup: () => rmSync(dir, { recursive: true, force: true })
  };
}

function applySchemaFile(databasePath: string): void {
  const handle = createDatabase(databasePath);
  handle.sqlite.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE plants (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      photo_path text,
      created_at text NOT NULL,
      updated_at text NOT NULL
    );

    CREATE TABLE recurrence_rules (
      plant_id text PRIMARY KEY NOT NULL REFERENCES plants(id) ON DELETE cascade,
      interval_days integer NOT NULL,
      created_at text NOT NULL,
      updated_at text NOT NULL
    );

    CREATE TABLE watering_events (
      id text PRIMARY KEY NOT NULL,
      plant_id text NOT NULL REFERENCES plants(id) ON DELETE cascade,
      watered_on text NOT NULL,
      created_at text NOT NULL
    );

    CREATE INDEX watering_events_plant_id_idx ON watering_events(plant_id);
    CREATE INDEX watering_events_watered_on_idx ON watering_events(watered_on);
  `);
  handle.sqlite.close();
}
