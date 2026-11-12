import Fastify from "fastify";
import { sql as drizzleSql } from "drizzle-orm";
import { env } from "./config/env.js";
import databasePlugin from "./plugins/database.js";

export function buildApp() {
  const app = Fastify({
    logger: { level: env.LOG_LEVEL },
  });

  app.register(databasePlugin);

  app.get("/health/live", async () => ({
    status: "ok",
    service: "wobbii-api",
  }));

  app.get("/health/ready", async (_request, reply) => {
    try {
      await app.db.execute(drizzleSql`SELECT 1`);

      return {
        status: "ok",
        database: "connected",
      };
    } catch (error) {
      app.log.error({ err: error }, "Database readiness check failed");

      return reply.code(503).send({
        status: "error",
        database: "unavailable",
      });
    }
  });

  return app;
}
