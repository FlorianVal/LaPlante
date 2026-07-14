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
