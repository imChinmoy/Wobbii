import fp from "fastify-plugin";
import { db, sql } from "../infrastructure/database/index.js";
export default fp(async (app) => {
    app.decorate("db", db);
    app.addHook("onClose", async () => {
        await sql.end();
    });
}, {
    name: "wobbii-database",
});
//# sourceMappingURL=database.js.map