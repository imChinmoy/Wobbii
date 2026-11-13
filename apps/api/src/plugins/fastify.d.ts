import "fastify";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import type { db } from "../infrastructure/database/client.js";

declare module "fastify" {
  interface FastifyInstance {
    db: typeof db;

    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      role: "CUSTOMER" | "ADMIN";
    };

    user: {
      sub: string;
      role: "CUSTOMER" | "ADMIN";
    };
  }
}

export {};
