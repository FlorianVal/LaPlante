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

  return { sqlite, db };
}
