import Fastify, { type FastifyInstance } from "fastify";

import { loadConfig } from "./config.js";
import { createDatabase, type AppDatabase } from "./db/client.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerPlantRoutes } from "./routes/plants.js";

export type BuildAppOptions = {
  databasePath?: string;
  db?: AppDatabase;
  today?: string;
};

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: true
  });

  const config = loadConfig();
  const databaseHandle = options.db
    ? null
    : createDatabase(options.databasePath ?? config.databasePath);
  const db = options.db ?? databaseHandle?.db;

  if (!db) {
    throw new Error("Database was not configured");
  }

  void app.register(registerHealthRoute);
  void app.register(registerPlantRoutes, { db, today: options.today });

  if (databaseHandle) {
    app.addHook("onClose", async () => {
      databaseHandle.sqlite.close();
    });
  }

  return app;
}
