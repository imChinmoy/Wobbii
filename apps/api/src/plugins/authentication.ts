import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { env } from "../config/env.js";

export default fp(
  async (app) => {
    await app.register(jwt, {
      secret: env.JWT_SECRET,
      sign: {
        expiresIn: "15m",
      },
    });

    app.decorate("authenticate", async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch {
        reply.code(401).send({
          status: "error",
          message: "Unauthorized",
        });
      }
    });
  },
  {
    name: "wobbii-authentication",
  },
);
