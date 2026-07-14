import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildApp } from "../app.js";

const WINDOW = "from=2026-05-03&to=2026-05-31";

describe("Persistence smoke tests", () => {
  // PERS-02: Plants and watering events survive server restart
  it("persists plants and watering events across database close/reopen", async () => {
    const { databasePath, cleanup } = createTempDatabasePath();

    const firstApp = buildApp({ databasePath, today: "2026-05-03" });

    const created = await firstApp.inject({
      method: "POST",
      url: `/api/plants?${WINDOW}`,
      payload: {
        name: "Persist Plant",
        intervalDays: 3,
        lastWateredOn: "2026-05-01"
      }
    });

    expect(created.statusCode).toBe(201);
    const plantId = created.json().id;

    const watered = await firstApp.inject({
      method: "POST",
      url: `/api/plants/${plantId}/waterings?${WINDOW}`,
      payload: { wateredOn: "2026-05-04" }
    });

    expect(watered.statusCode).toBe(200);
    expect(watered.json().schedule.nextDueDate).toBe("2026-05-07");

    await firstApp.close();

    // Simulate server restart with same database
    const reopened = buildApp({ databasePath, today: "2026-05-05" });
    const listed = await reopened.inject({
      method: "GET",
      url: `/api/plants?${WINDOW}`
    });

    expect(listed.statusCode).toBe(200);
    const plants = listed.json();
    expect(plants).toHaveLength(1);
    expect(plants[0]).toMatchObject({
      name: "Persist Plant",
      id: plantId,
      recurrence: { intervalDays: 3 }
    });

    // Watering event shifted the schedule: watered on 05-04, next due 05-07
    // Today is 05-05, so 05-07 is in the future -- not overdue
    expect(plants[0].schedule.nextDueDate).toBe("2026-05-07");
    expect(plants[0].schedule.isOverdue).toBe(false);

    await reopened.close();
    cleanup();
  });

  // PERS-02: Multiple watering events survive restart
  it("persists multiple watering events across database close/reopen", async () => {
    const { databasePath, cleanup } = createTempDatabasePath();

    const firstApp = buildApp({ databasePath, today: "2026-05-03" });

    const created = await firstApp.inject({
      method: "POST",
      url: `/api/plants?${WINDOW}`,
      payload: {
        name: "Weekly Plant",
        intervalDays: 7,
        lastWateredOn: "2026-04-20"
      }
    });

    expect(created.statusCode).toBe(201);
    const plantId = created.json().id;

    // First watering event
    await firstApp.inject({
      method: "POST",
      url: `/api/plants/${plantId}/waterings?${WINDOW}`,
      payload: { wateredOn: "2026-04-27" }
    });

    // Second watering event
    const secondWatering = await firstApp.inject({
      method: "POST",
      url: `/api/plants/${plantId}/waterings?${WINDOW}`,
      payload: { wateredOn: "2026-05-04" }
    });

    expect(secondWatering.statusCode).toBe(200);
    expect(secondWatering.json().schedule.nextDueDate).toBe("2026-05-11");

    await firstApp.close();

    // Reopen and verify both watering events are reflected
    const reopened = buildApp({ databasePath, today: "2026-05-05" });
    const listed = await reopened.inject({
      method: "GET",
      url: `/api/plants?${WINDOW}`
    });

    expect(listed.statusCode).toBe(200);
    const plants = listed.json();
    expect(plants).toHaveLength(1);
    expect(plants[0].name).toBe("Weekly Plant");

    // Last watering was 05-04, interval 7 days, so next due 05-11
    expect(plants[0].schedule.nextDueDate).toBe("2026-05-11");
    expect(plants[0].schedule.futureWateringDates).toContain("2026-05-11");
    expect(plants[0].schedule.futureWateringDates).toContain("2026-05-18");

    await reopened.close();
    cleanup();
  });

  // PERS-03: Photo metadata survives server restart
  it("persists photo path across database close/reopen", async () => {
    const { databasePath, cleanup } = createTempDatabasePath();

    const photosDir = join(dirname(databasePath), "photos");
    mkdirSync(photosDir, { recursive: true });

    const firstApp = buildApp({ databasePath, today: "2026-05-03", photosDir });

    const created = await firstApp.inject({
      method: "POST",
      url: `/api/plants?${WINDOW}`,
      payload: {
        name: "Photo Plant",
        intervalDays: 5,
        lastWateredOn: "2026-05-01",
        photoPath: "test-plant-photo.jpg"
      }
    });

    expect(created.statusCode).toBe(201);
    expect(created.json().photoPath).toBe("test-plant-photo.jpg");
    const plantId = created.json().id;

    await firstApp.close();

    // Reopen and verify photo path persisted
    const reopened = buildApp({ databasePath, today: "2026-05-03", photosDir });
    const listed = await reopened.inject({
      method: "GET",
      url: `/api/plants?${WINDOW}`
    });

    expect(listed.statusCode).toBe(200);
    const plants = listed.json();
    expect(plants).toHaveLength(1);
    expect(plants[0].photoPath).toBe("test-plant-photo.jpg");
    expect(plants[0].id).toBe(plantId);

    await reopened.close();
    cleanup();
  });

  // PERS-01: Plants survive browser-refresh equivalent
  it("returns identical plant data on repeated GET requests", async () => {
    const { databasePath, cleanup } = createTempDatabasePath();

    const app = buildApp({ databasePath, today: "2026-05-03" });

    const created = await app.inject({
      method: "POST",
      url: `/api/plants?${WINDOW}`,
      payload: {
        name: "Stable Plant",
        intervalDays: 4,
        lastWateredOn: "2026-05-02"
      }
    });

    expect(created.statusCode).toBe(201);
    const plantId = created.json().id;

    // First GET (simulates initial page load)
    const first = await app.inject({
      method: "GET",
      url: `/api/plants?${WINDOW}`
    });

    // Second GET (simulates browser refresh)
    const second = await app.inject({
      method: "GET",
      url: `/api/plants?${WINDOW}`
    });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);

    const firstData = first.json();
    const secondData = second.json();

    expect(firstData).toHaveLength(1);
    expect(secondData).toHaveLength(1);

    // Verify identical data across requests
    expect(firstData[0].id).toBe(secondData[0].id);
    expect(firstData[0].id).toBe(plantId);
    expect(firstData[0].name).toBe(secondData[0].name);
    expect(firstData[0].name).toBe("Stable Plant");
    expect(firstData[0].recurrence.intervalDays).toBe(
      secondData[0].recurrence.intervalDays
    );
    expect(firstData[0].recurrence.intervalDays).toBe(4);
    expect(firstData[0].schedule.nextDueDate).toBe(
      secondData[0].schedule.nextDueDate
    );

    await app.close();
    cleanup();
  });
});

function createTempDatabasePath(): {
  databasePath: string;
  cleanup: () => void;
} {
  const dir = mkdtempSync(join(tmpdir(), "laplante-persistence-"));

  return {
    databasePath: join(dir, "laplante.sqlite"),
    cleanup: () => rmSync(dir, { recursive: true, force: true })
  };
}
