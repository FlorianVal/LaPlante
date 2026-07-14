import {
  todayISO,
  type ISODateString
} from "@laplante/shared";
import type { FastifyInstance } from "fastify";

import type { AppDatabase } from "../db/client.js";
import { getDashboardSummary } from "../services/dashboard-summary.js";

export async function registerDashboardSummaryRoute(
  app: FastifyInstance,
  options: { db: AppDatabase; today?: string }
): Promise<void> {
  app.get("/api/dashboard-summary", async () =>
    getDashboardSummary(
      options.db,
      (options.today ?? todayISO()) as ISODateString
    )
  );
}
