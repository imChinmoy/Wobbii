import { pgTable, uuid, timestamp, pgEnum, index, } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { slots } from "./slots.js";
export const reservationStatusEnum = pgEnum("reservation_status", ["HELD", "CONFIRMED", "EXPIRED", "CANCELLED"]);
export const reservations = pgTable("reservations", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    slotId: uuid("slot_id")
        .notNull()
        .references(() => slots.id),
    status: reservationStatusEnum("status")
        .default("HELD")
        .notNull(),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
    }),
    confirmedAt: timestamp("confirmed_at", {
        withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    }).defaultNow().notNull(),
}, (table) => [
    index("reservations_slot_id_idx").on(table.slotId),
    index("reservations_user_id_idx").on(table.userId),
]);
//# sourceMappingURL=reservations.js.map