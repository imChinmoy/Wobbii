import { pgTable, uuid, integer, timestamp, pgEnum, index, check, } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { resources } from "./resources.js";
export const slotStatusEnum = pgEnum("slot_status", [
    "OPEN",
    "CLOSED",
]);
export const slots = pgTable("slots", {
    id: uuid("id").defaultRandom().primaryKey(),
    resourceId: uuid("resource_id")
        .notNull()
        .references(() => resources.id),
    startAt: timestamp("start_at", {
        withTimezone: true,
    }).notNull(),
    endAt: timestamp("end_at", {
        withTimezone: true,
    }).notNull(),
    capacity: integer("capacity").notNull(),
    allocatedCount: integer("allocated_count")
        .default(0)
        .notNull(),
    status: slotStatusEnum("status")
        .default("OPEN")
        .notNull(),
}, (table) => [
    index("slots_resource_id_idx").on(table.resourceId),
    check("slots_capacity_positive", sql `${table.capacity} > 0`),
    check("slots_allocated_valid", sql `${table.allocatedCount} >= 0 AND ${table.allocatedCount} <= ${table.capacity}`),
    check("slots_valid_time_range", sql `${table.endAt} > ${table.startAt}`),
]);
//# sourceMappingURL=slots.js.map