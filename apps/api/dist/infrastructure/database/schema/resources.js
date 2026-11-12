import { pgTable, uuid, varchar, text, timestamp, pgEnum, } from "drizzle-orm/pg-core";
export const resourceStatusEnum = pgEnum("resource_status", [
    "ACTIVE",
    "INACTIVE",
]);
export const resources = pgTable("resources", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    location: varchar("location", { length: 255 }),
    status: resourceStatusEnum("status").default("ACTIVE").notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
});
//# sourceMappingURL=resources.js.map