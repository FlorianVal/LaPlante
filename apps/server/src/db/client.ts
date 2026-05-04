import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createRequire } from "node:module";

import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema.js";

type SQLiteDatabase = {
  close(): void;
  exec(source: string): void;
};

type BetterSqlite3Constructor = new (path: string) => SQLiteDatabase;

const require = createRequire(import.meta.url);
const BetterSqlite3 = require("better-sqlite3") as BetterSqlite3Constructor;

export type AppDatabase = BetterSQLite3Database<typeof schema>;

export type DatabaseHandle = {
  sqlite: SQLiteDatabase;
  db: AppDatabase;
};

export function createDatabase(databasePath: string): DatabaseHandle {
  mkdirSync(dirname(databasePath), { recursive: true });

  const sqlite = new BetterSqlite3(databasePath);
  const db = drizzle(sqlite, { schema }) as AppDatabase;

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS plants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      photo_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS recurrence_rules (
      plant_id TEXT PRIMARY KEY REFERENCES plants(id) ON DELETE CASCADE,
      interval_days INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS watering_events (
      id TEXT PRIMARY KEY,
      plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
      watered_on TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS watering_events_plant_id_idx ON watering_events(plant_id);
    CREATE INDEX IF NOT EXISTS watering_events_watered_on_idx ON watering_events(watered_on);
  `);

  return { sqlite, db };
}
