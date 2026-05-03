import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

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

  describe("multipart photo upload", () => {
    it("creates a plant with photo via multipart form data", async () => {
      const { app, photosDir, cleanup } = createTestAppWithPhotos();

      const { body, boundary } = buildMultipartBody(
        { name: "Monstera", intervalDays: "7" },
        { name: "monstera.jpg", content: Buffer.from("fake-jpeg-data"), contentType: "image/jpeg" }
      );

      const created = await app.inject({
        method: "POST",
        url: `/api/plants?${WINDOW}`,
        payload: body,
        headers: { "content-type": `multipart/form-data; boundary=${boundary}` }
      });

      expect(created.statusCode).toBe(201);
      const json = created.json();
      expect(json.photoPath).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-/);
      expect(json.photoPath).toMatch(/\.jpg$/);
      expect(json.name).toBe("Monstera");

      // Verify file exists on disk
      const savedPath = join(photosDir, json.photoPath);
      expect(existsSync(savedPath)).toBe(true);
      expect(readFileSync(savedPath)).toEqual(Buffer.from("fake-jpeg-data"));

      await app.close();
      cleanup();
    });

    it("creates a plant without photo via multipart form data", async () => {
      const { app, cleanup } = createTestAppWithPhotos();

      const { body, boundary } = buildMultipartBody(
        { name: "Ficus", intervalDays: "5" }
      );

      const created = await app.inject({
        method: "POST",
        url: `/api/plants?${WINDOW}`,
        payload: body,
        headers: { "content-type": `multipart/form-data; boundary=${boundary}` }
      });

      expect(created.statusCode).toBe(201);
      expect(created.json().photoPath).toBeNull();
      expect(created.json().name).toBe("Ficus");

      await app.close();
      cleanup();
    });

    it("rejects photo exceeding 5MB limit", async () => {
      const { app, cleanup } = createTestAppWithPhotos();

      // Create a 6MB buffer
      const bigContent = Buffer.alloc(6 * 1024 * 1024, "x");

      const { body, boundary } = buildMultipartBody(
        { name: "BigPlant", intervalDays: "7" },
        { name: "big.jpg", content: bigContent, contentType: "image/jpeg" }
      );

      const created = await app.inject({
        method: "POST",
        url: `/api/plants?${WINDOW}`,
        payload: body,
        headers: { "content-type": `multipart/form-data; boundary=${boundary}` }
      });

      expect(created.statusCode).toBe(413);

      await app.close();
      cleanup();
    });

    it("serves uploaded photo file at /photos/{filename}", async () => {
      const { app, cleanup } = createTestAppWithPhotos();

      const { body, boundary } = buildMultipartBody(
        { name: "Succulent", intervalDays: "14" },
        { name: "succulent.png", content: Buffer.from("png-data-here"), contentType: "image/png" }
      );

      const created = await app.inject({
        method: "POST",
        url: `/api/plants?${WINDOW}`,
        payload: body,
        headers: { "content-type": `multipart/form-data; boundary=${boundary}` }
      });

      expect(created.statusCode).toBe(201);
      const photoPath = created.json().photoPath;

      const fetched = await app.inject({
        method: "GET",
        url: `/photos/${photoPath}`
      });

      expect(fetched.statusCode).toBe(200);
      expect(fetched.body.toString()).toBe("png-data-here");

      await app.close();
      cleanup();
    });
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

function createTestAppWithPhotos() {
  const { databasePath, cleanup } = createTempDatabasePath();
  applySchemaFile(databasePath);
  const photosDir = join(dirname(databasePath), "photos");
  mkdirSync(photosDir, { recursive: true });

  return {
    app: buildApp({
      databasePath,
      today: "2026-05-03",
      photosDir
    }),
    photosDir,
    cleanup
  };
}

function buildMultipartBody(
  fields: Record<string, string>,
  file?: { name: string; content: Buffer; contentType: string }
): { body: Buffer; boundary: string } {
  const boundary = `----FormBoundary${randomBytes(8).toString("hex")}`;
  const parts: Buffer[] = [];

  for (const [key, value] of Object.entries(fields)) {
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
    ));
  }

  if (file) {
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="${file.name}"\r\nContent-Type: ${file.contentType}\r\n\r\n`
    ));
    parts.push(file.content);
    parts.push(Buffer.from("\r\n"));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`));
  return { body: Buffer.concat(parts), boundary };
}
