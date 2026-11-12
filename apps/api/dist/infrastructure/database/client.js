import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../../config/env.js";
import * as schema from "./schema/index.js";
export const sql = postgres(env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
});
export const db = drizzle(sql, { schema });
//# sourceMappingURL=client.js.map