import { mkdirSync } from "node:fs";
import path from "node:path";

import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance } from "fastify";

import { loadConfig } from "./config.js";
import { createDatabase, type AppDatabase } from "./db/client.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerPlantRoutes } from "./routes/plants.js";

const PHOTOS_DIR = path.resolve("data/photos");

export type BuildAppOptions = {
  databasePath?: string;
  db?: AppDatabase;
  today?: string;
  photosDir?: string;
};

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const photosDir = options.photosDir ?? PHOTOS_DIR;
  mkdirSync(photosDir, { recursive: true });

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

  app.register(multipart, {
    limits: {
      fileSize: 5_000_000, // 5 MB
      files: 1,
      fields: 5
    }
  });

  app.register(fastifyStatic, {
    root: photosDir,
    prefix: "/photos/",
    serveDotFiles: false
  });

  void app.register(registerPlantRoutes, {
    db,
    today: options.today,
    photosDir
  });

  if (databaseHandle) {
    app.addHook("onClose", async () => {
      databaseHandle.sqlite.close();
    });
  }

  return app;
}
