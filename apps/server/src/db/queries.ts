import { randomUUID } from "node:crypto";

import { desc, eq } from "drizzle-orm";

import type { AppDatabase } from "./client.js";
import { plants, recurrenceRules, wateringEvents } from "./schema.js";

type PlantId = string;
type ISODateString = string;

export type PlantWithRecurrence = {
  id: PlantId;
  name: string;
  photoPath: string | null;
  intervalDays: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type WateringEvent = {
  id: string;
  plantId: PlantId;
  wateredOn: ISODateString;
  createdAt: string;
};

export type CreatePlantWithRecurrenceInput = {
  name: string;
  photoPath?: string | null;
  intervalDays: number;
  lastWateredOn: ISODateString;
};

export type UpdatePlantWithRecurrenceInput = {
  name?: string;
  photoPath?: string | null;
  intervalDays?: number;
};

export type RecordWateringInput = {
  plantId: PlantId;
  wateredOn: ISODateString;
};

export function createPlantWithRecurrence(
  db: AppDatabase,
  input: CreatePlantWithRecurrenceInput
): PlantWithRecurrence {
  const id = randomUUID();
  const now = new Date().toISOString();

  db.transaction((tx) => {
    tx.insert(plants).values({
      id,
      name: input.name,
      photoPath: input.photoPath ?? null,
      createdAt: now,
      updatedAt: now
    }).run();

    tx.insert(recurrenceRules).values({
      plantId: id,
      intervalDays: input.intervalDays,
      createdAt: now,
      updatedAt: now
    }).run();

    tx.insert(wateringEvents).values({
      id: randomUUID(),
      plantId: id,
      wateredOn: input.lastWateredOn,
      createdAt: now
    }).run();
  });

  const plant = getPlantWithRecurrence(db, id);
  if (!plant) {
    throw new Error("Created plant could not be read");
  }

  return plant;
}

export function updatePlantWithRecurrence(
  db: AppDatabase,
  plantId: PlantId,
  input: UpdatePlantWithRecurrenceInput
): PlantWithRecurrence | null {
  const now = new Date().toISOString();

  db.transaction((tx) => {
    const plantUpdates: Record<string, unknown> = { updatedAt: now };
    if (input.name !== undefined) plantUpdates.name = input.name;
    if (input.photoPath !== undefined) plantUpdates.photoPath = input.photoPath;

    if (Object.keys(plantUpdates).length > 1) {
      tx.update(plants).set(plantUpdates).where(eq(plants.id, plantId)).run();
    }

    if (input.intervalDays !== undefined) {
      tx.update(recurrenceRules)
        .set({ intervalDays: input.intervalDays, updatedAt: now })
        .where(eq(recurrenceRules.plantId, plantId))
        .run();
    }
  });

  return getPlantWithRecurrence(db, plantId);
}

export function listPlantsWithRecurrence(db: AppDatabase): PlantWithRecurrence[] {
  return db
    .select()
    .from(plants)
    .innerJoin(recurrenceRules, eq(plants.id, recurrenceRules.plantId))
    .all()
    .map(toPlantWithRecurrence);
}

export function getPlantWithRecurrence(
  db: AppDatabase,
  plantId: PlantId
): PlantWithRecurrence | null {
  const row = db
    .select()
    .from(plants)
    .innerJoin(recurrenceRules, eq(plants.id, recurrenceRules.plantId))
    .where(eq(plants.id, plantId))
    .get();

  return row ? toPlantWithRecurrence(row) : null;
}

export function recordWatering(
  db: AppDatabase,
  input: RecordWateringInput
): WateringEvent {
  const event: WateringEvent = {
    id: randomUUID(),
    plantId: input.plantId,
    wateredOn: input.wateredOn,
    createdAt: new Date().toISOString()
  };

  db.insert(wateringEvents).values(event).run();

  return event;
}

export function listWateringEvents(
  db: AppDatabase,
  plantId: PlantId
): WateringEvent[] {
  return db
    .select()
    .from(wateringEvents)
    .where(eq(wateringEvents.plantId, plantId))
    .orderBy(desc(wateringEvents.wateredOn))
    .all();
}

function toPlantWithRecurrence(row: {
  plants: typeof plants.$inferSelect;
  recurrence_rules: typeof recurrenceRules.$inferSelect;
}): PlantWithRecurrence {
  return {
    id: row.plants.id,
    name: row.plants.name,
    photoPath: row.plants.photoPath,
    intervalDays: row.recurrence_rules.intervalDays,
    createdAt: row.plants.createdAt,
    updatedAt: row.plants.updatedAt
  };
}
