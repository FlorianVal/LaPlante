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

    const body = createPlantSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: "Invalid plant input" });
    }

    const plant = plantService.createPlant(body.data, window.value);
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
