import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const plants = sqliteTable("plants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  photoPath: text("photo_path"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const recurrenceRules = sqliteTable("recurrence_rules", {
  plantId: text("plant_id")
    .primaryKey()
    .references(() => plants.id, { onDelete: "cascade" }),
  intervalDays: integer("interval_days").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const wateringEvents = sqliteTable(
  "watering_events",
  {
    id: text("id").primaryKey(),
    plantId: text("plant_id")
      .notNull()
      .references(() => plants.id, { onDelete: "cascade" }),
    wateredOn: text("watered_on").notNull(),
    createdAt: text("created_at").notNull()
  },
  (table) => [
    index("watering_events_plant_id_idx").on(table.plantId),
    index("watering_events_watered_on_idx").on(table.wateredOn)
  ]
);
