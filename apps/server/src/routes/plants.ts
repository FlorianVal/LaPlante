import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";

import { differenceInCalendarDays } from "date-fns";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { parseISODate, type ISODateString } from "@laplante/shared";

import type { AppDatabase } from "../db/client.js";
import { createPlantService } from "../services/plants.js";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const windowQuerySchema = z.object({
  from: isoDateSchema,
  to: isoDateSchema
});

const createPlantSchema = z.object({
  name: z.string().trim().min(1),
  intervalDays: z.number().int().min(1),
  lastWateredOn: isoDateSchema.optional(),
  photoPath: z.string().nullable().optional()
});

const recordWateringSchema = z.object({
  wateredOn: isoDateSchema.optional()
});

export type PlantRoutesOptions = {
  db: AppDatabase;
  today?: string;
  photosDir?: string;
};

export async function registerPlantRoutes(
  app: FastifyInstance,
  options: PlantRoutesOptions
): Promise<void> {
  const plantService = createPlantService(options.db, {
    today: options.today as ISODateString | undefined
  });

  app.get("/api/plants", async (request, reply) => {
    const window = parseWindow(request.query);
    if (!window.ok) {
      return reply.code(400).send({ error: window.error });
    }

    return plantService.listPlants(window.value);
  });

  app.get("/api/plants/:id", async (request, reply) => {
    const window = parseWindow(request.query);
    if (!window.ok) {
      return reply.code(400).send({ error: window.error });
    }

    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ error: "Invalid plant id" });
    }

    const plant = plantService.getPlant(params.data.id, window.value);
    if (!plant) {
      return reply.code(404).send({ error: "Plant not found" });
    }

    return plant;
  });

  app.post("/api/plants", async (request, reply) => {
    const window = parseWindow(request.query);
    if (!window.ok) {
      return reply.code(400).send({ error: window.error });
    }

    const contentType = request.headers["content-type"] ?? "";
    let name: string;
    let intervalDays: number;
    let lastWateredOn: ISODateString | undefined;
    let photoPath: string | null = null;

    const photosDir = options.photosDir ?? path.resolve("data/photos");

    if (contentType.startsWith("multipart/form-data")) {
      // Handle multipart upload using parts() iterator
      // Collect all fields and the first file part
      const fieldValues: Record<string, string> = {};
      let fileData: { buffer: Buffer; mimetype: string; filename: string } | undefined;

      for await (const part of request.parts()) {
        if (part.type === "field") {
          fieldValues[part.fieldname] = String(part.value);
        } else if (part.type === "file" && !fileData) {
          const buffer = await part.toBuffer();
          if (!part.file.truncated) {
            fileData = {
              buffer,
              mimetype: part.mimetype,
              filename: part.filename
            };
          } else {
            return reply.code(413).send({ error: "File too large" });
          }
        }
      }

      name = fieldValues["name"] ?? "";
      intervalDays = Number(fieldValues["intervalDays"] ?? "0");
      lastWateredOn = undefined;

      // Process file if present and is an image
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (fileData && fileData.mimetype && allowedMimeTypes.includes(fileData.mimetype)) {
        const ext = fileData.filename?.split(".").pop() ?? "jpg";
        const safeName = `${randomUUID()}.${ext}`;
        const filePath = path.join(photosDir, safeName);

        writeFileSync(filePath, fileData.buffer);
        photoPath = safeName;
      }

      // Validate extracted fields
      const parsed = createPlantSchema.safeParse({ name, intervalDays });
      if (!parsed.success) {
        return reply.code(400).send({ error: "Invalid plant input" });
      }
      name = parsed.data.name;
      intervalDays = parsed.data.intervalDays;
    } else {
      // Handle JSON body (existing behavior)
      const body = createPlantSchema.safeParse(request.body);
      if (!body.success) {
        return reply.code(400).send({ error: "Invalid plant input" });
      }
      name = body.data.name;
      intervalDays = body.data.intervalDays;
      lastWateredOn = body.data.lastWateredOn;
      photoPath = body.data.photoPath ?? null;
    }

    const plant = plantService.createPlant(
      { name, intervalDays, lastWateredOn, photoPath },
      window.value
    );
    return reply.code(201).send(plant);
  });

  app.post("/api/plants/:id/waterings", async (request, reply) => {
    const window = parseWindow(request.query);
    if (!window.ok) {
      return reply.code(400).send({ error: window.error });
    }

    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ error: "Invalid plant id" });
    }

    const body = recordWateringSchema.safeParse(request.body ?? {});
    if (!body.success) {
      return reply.code(400).send({ error: "Invalid watering input" });
    }

    const plant = plantService.recordWatering(
      params.data.id,
      body.data,
      window.value
    );
    if (!plant) {
      return reply.code(404).send({ error: "Plant not found" });
    }

    return plant;
  });
}

function parseWindow(
  query: unknown
):
  | { ok: true; value: { from: ISODateString; to: ISODateString } }
  | { ok: false; error: string } {
  const parsed = windowQuerySchema.safeParse(query);
  if (!parsed.success) {
    return { ok: false, error: "Invalid date window" };
  }

  try {
    const from = parsed.data.from as ISODateString;
    const to = parsed.data.to as ISODateString;
    const fromDate = parseISODate(from);
    const toDate = parseISODate(to);

    if (differenceInCalendarDays(toDate, fromDate) > 370) {
      return { ok: false, error: "Date window cannot exceed 370 days" };
    }

    return { ok: true, value: { from, to } };
  } catch {
    return { ok: false, error: "Invalid date window" };
  }
}
