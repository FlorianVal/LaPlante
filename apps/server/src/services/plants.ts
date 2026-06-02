import {
  buildScheduleSummary,
  getLatestWateringAnchor,
  todayISO,
  type ISODateString,
  type PlantResponse,
  type ScheduleWindow
} from "@laplante/shared";

import type { AppDatabase } from "../db/client.js";
import {
  createPlantWithRecurrence,
  getPlantWithRecurrence,
  listPlantsWithRecurrence,
  listWateringEvents,
  recordWatering as insertWatering,
  updatePlantWithRecurrence
} from "../db/queries.js";

export type CreatePlantInput = {
  name: string;
  intervalDays: number;
  lastWateredOn?: ISODateString;
  photoPath?: string | null;
};

export type RecordWateringInput = {
  wateredOn?: ISODateString;
};

export type UpdatePlantInput = {
  name?: string;
  intervalDays?: number;
  photoPath?: string | null;
};

export type PlantService = ReturnType<typeof createPlantService>;

export function createPlantService(
  db: AppDatabase,
  options: { today?: ISODateString } = {}
) {
  const currentDay = () => options.today ?? todayISO();

  return {
    listPlants(window: ScheduleWindow): PlantResponse[] {
      return listPlantsWithRecurrence(db).map((plant) =>
        toPlantResponse(db, plant.id, window, currentDay())
      );
    },

    getPlant(id: string, window: ScheduleWindow): PlantResponse | null {
      const plant = getPlantWithRecurrence(db, id);
      return plant ? toPlantResponse(db, plant.id, window, currentDay()) : null;
    },

    createPlant(input: CreatePlantInput, window: ScheduleWindow): PlantResponse {
      const lastWateredOn = input.lastWateredOn ?? currentDay();
      const plant = createPlantWithRecurrence(db, {
        name: input.name,
        intervalDays: input.intervalDays,
        lastWateredOn,
        photoPath: input.photoPath ?? null
      });

      return toPlantResponse(db, plant.id, window, currentDay());
    },

    updatePlant(
      id: string,
      input: UpdatePlantInput,
      window: ScheduleWindow
    ): PlantResponse | null {
      const updated = updatePlantWithRecurrence(db, id, input);
      if (!updated) return null;
      return toPlantResponse(db, updated.id, window, currentDay());
    },

    recordWatering(
      plantId: string,
      input: RecordWateringInput,
      window: ScheduleWindow
    ): PlantResponse | null {
      const plant = getPlantWithRecurrence(db, plantId);
      if (!plant) {
        return null;
      }

      insertWatering(db, {
        plantId,
        wateredOn: input.wateredOn ?? currentDay()
      });

      return toPlantResponse(db, plantId, window, currentDay());
    }
  };
}

export function toPlantResponse(
  db: AppDatabase,
  plantId: string,
  window: ScheduleWindow,
  today: ISODateString
): PlantResponse {
  const plant = getPlantWithRecurrence(db, plantId);
  if (!plant) {
    throw new Error("Plant not found");
  }

  const wateringEvents = listWateringEvents(db, plant.id);
  const anchor = getLatestWateringAnchor(
    wateringEvents.at(-1)?.wateredOn ?? today,
    wateringEvents.map((event) => event.wateredOn)
  );

  return {
    id: plant.id,
    name: plant.name,
    photoPath: plant.photoPath,
    recurrence: { intervalDays: plant.intervalDays },
    schedule: buildScheduleSummary({
      intervalDays: plant.intervalDays,
      lastWateredOn: anchor,
      today,
      window
    })
  };
}
