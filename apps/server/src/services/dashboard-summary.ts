import {
  buildScheduleSummary,
  type DashboardSummary,
  type ISODateString
} from "@laplante/shared";

import type { AppDatabase } from "../db/client.js";
import {
  getLatestWateringDate,
  listPlantsWithRecurrence,
  listWateringEvents
} from "../db/queries.js";

export function getDashboardSummary(
  db: AppDatabase,
  today: ISODateString
): DashboardSummary {
  const overdueCount = listPlantsWithRecurrence(db).filter((plant) => {
    const lastWateredOn = listWateringEvents(db, plant.id)[0]?.wateredOn ?? today;
    return buildScheduleSummary({
      intervalDays: plant.intervalDays,
      lastWateredOn,
      today,
      window: { from: today, to: today }
    }).isOverdue;
  }).length;

  return { overdueCount, lastWateredOn: getLatestWateringDate(db) };
}
