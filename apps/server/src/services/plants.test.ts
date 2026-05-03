import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createDatabase } from "../db/client.js";
import { createPlantService } from "./plants.js";

describe("plant service", () => {
  it("returns schedule summaries and late watering resets cadence", () => {
    const { databasePath, cleanup } = createTempDatabasePath();
    const handle = createDatabase(databasePath);
    applySchema(handle.sqlite);

    const service = createPlantService(handle.db, { today: "2026-05-10" });
    const window = { from: "2026-05-03", to: "2026-05-31" };

    const plant = service.createPlant(
      { name: "Monstera", intervalDays: 7, lastWateredOn: "2026-05-01" },
      window
    );
    expect(plant.schedule.nextDueDate).toBe("2026-05-08");
    expect(plant.schedule.isOverdue).toBe(true);

    const watered = service.recordWatering(
      plant.id,
      { wateredOn: "2026-05-10" },
      window
    );

    expect(watered?.schedule.nextDueDate).toBe("2026-05-17");
    expect(watered?.schedule.isOverdue).toBe(false);

    handle.sqlite.close();
    cleanup();
  });
});

function createTempDatabasePath(): {
  databasePath: string;
  cleanup: () => void;
} {
  const dir = mkdtempSync(join(tmpdir(), "laplante-service-"));

  return {
    databasePath: join(dir, "laplante.sqlite"),
    cleanup: () => rmSync(dir, { recursive: true, force: true })
  };
}

function applySchema(sqlite: { exec(source: string): void }): void {
  sqlite.exec(`
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
}
