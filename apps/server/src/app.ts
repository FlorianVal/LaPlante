import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance } from "fastify";

import { loadConfig } from "./config.js";
import { createDatabase, type AppDatabase } from "./db/client.js";
import { registerDashboardSummaryRoute } from "./routes/dashboard-summary.js";
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

  void app.register(registerDashboardSummaryRoute, {
    db,
    today: options.today
  });

  if (databaseHandle) {
    app.addHook("onClose", async () => {
      databaseHandle.sqlite.close();
    });
  }

  // Serve React SPA in production (if public/ exists)
  const publicDir = path.resolve("public");
  if (existsSync(publicDir)) {
    app.register(fastifyStatic, {
      root: publicDir,
      prefix: "/",
      wildcard: false,
      decorateReply: false
    });
    // SPA fallback: serve index.html for unmatched non-API routes
    app.setNotFoundHandler(async (_req, reply) => {
      return reply.sendFile("index.html");
    });
  }

  return app;
}
