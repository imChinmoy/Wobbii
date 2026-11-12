import "fastify";
import type { db } from "../infrastructure/database/client.js";

declare module "fastify" {
  interface FastifyInstance {
    db: typeof db;
  }
}

export {};
