import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createDatabase } from "./client.js";
import {
  createPlantWithRecurrence,
  listWateringEvents,
  getPlantWithRecurrence,
  recordWatering
} from "./queries.js";

describe("persistence queries", () => {
  it("persists plants, recurrence rules, and watering events after reopening", () => {
    const { databasePath, cleanup } = createTempDatabasePath();

    const firstHandle = createDatabase(databasePath);
    applySchema(firstHandle.sqlite);

    const plant = createPlantWithRecurrence(firstHandle.db, {
      name: "Monstera",
      intervalDays: 7,
      lastWateredOn: "2026-05-01"
    });

    recordWatering(firstHandle.db, {
      plantId: plant.id,
      wateredOn: "2026-05-10"
    });

    firstHandle.sqlite.close();

    const secondHandle = createDatabase(databasePath);
    const reopenedPlant = getPlantWithRecurrence(secondHandle.db, plant.id);
    const events = listWateringEvents(secondHandle.db, plant.id);

    expect(reopenedPlant).toMatchObject({
      id: plant.id,
      name: "Monstera",
      intervalDays: 7,
      photoPath: null
    });
    expect(events.map((event) => event.wateredOn)).toEqual([
      "2026-05-10",
      "2026-05-01"
    ]);

    secondHandle.sqlite.close();
    cleanup();
  });

  it("stores one watering event per confirmation and no occurrence rows", () => {
    const { databasePath, cleanup } = createTempDatabasePath();
    const handle = createDatabase(databasePath);
    applySchema(handle.sqlite);

    const plant = createPlantWithRecurrence(handle.db, {
      name: "Monstera",
      intervalDays: 7,
      lastWateredOn: "2026-05-01"
    });

    recordWatering(handle.db, {
      plantId: plant.id,
      wateredOn: "2026-05-10"
    });

    const events = listWateringEvents(handle.db, plant.id);
    expect(events).toHaveLength(2);

    handle.sqlite.close();
    cleanup();
  });
});

function createTempDatabasePath(): {
  databasePath: string;
  cleanup: () => void;
} {
  const dir = mkdtempSync(join(tmpdir(), "laplante-db-"));

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
