import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { resources } from "../../infrastructure/database/schema/resources.js";
import { requireRole } from "../../common/authorization.js";

const createResourceSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(255).optional(),
});

const resourceRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/",
    {
      preHandler: [app.authenticate, requireRole("ADMIN")],
    },
    async (request, reply) => {
      const parsed = createResourceSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          status: "error",
          message: "Invalid resource data",
          errors: parsed.error.issues,
        });
      }

      const [resource] = await app.db
        .insert(resources)
        .values({
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          location: parsed.data.location ?? null,
        })
        .returning();

      return reply.code(201).send({
        status: "success",
        resource,
      });
    },
  );

  app.get("/", async () => {
    const result = await app.db
      .select()
      .from(resources)
      .where(eq(resources.status, "ACTIVE"));

    return {
      status: "success",
      resources: result,
    };
  });
};

export default resourceRoutes;
