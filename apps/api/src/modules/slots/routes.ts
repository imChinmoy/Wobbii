import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { and, eq, gte, lt } from "drizzle-orm";

import { slots } from "../../infrastructure/database/schema/slots.js";
import { resources } from "../../infrastructure/database/schema/resources.js";
import { requireRole } from "../../common/authorization.js";

const createSlotSchema = z
  .object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    capacity: z.number().int().positive().max(10000),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: "End time must be after start time",
    path: ["endAt"],
  });

const resourceIdSchema = z.string().uuid();

const slotRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/resources/:resourceId/slots",
    {
      preHandler: [app.authenticate, requireRole("ADMIN")],
    },
    async (request, reply) => {
      const params = resourceIdSchema.safeParse(
        (request.params as { resourceId: string }).resourceId,
      );

      const body = createSlotSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.code(400).send({
          status: "error",
          message: "Invalid slot data",
          errors: [
            ...(!params.success ? params.error.issues : []),
            ...(!body.success ? body.error.issues : []),
          ],
        });
      }

      const resourceId = params.data;

      const [resource] = await app.db
        .select({ id: resources.id })
        .from(resources)
        .where(
          and(eq(resources.id, resourceId), eq(resources.status, "ACTIVE")),
        )
        .limit(1);

      if (!resource) {
        return reply.code(404).send({
          status: "error",
          message: "Resource not found",
        });
      }

      const [slot] = await app.db
        .insert(slots)
        .values({
          resourceId,
          startAt: body.data.startAt,
          endAt: body.data.endAt,
          capacity: body.data.capacity,
        })
        .returning();

      return reply.code(201).send({
        status: "success",
        slot,
      });
    },
  );

  app.get("/resources/:resourceId/slots", async (request, reply) => {
    const params = resourceIdSchema.safeParse(
      (request.params as { resourceId: string }).resourceId,
    );

    if (!params.success) {
      return reply.code(400).send({
        status: "error",
        message: "Invalid resource ID",
      });
    }

    const [resource] = await app.db
      .select({ id: resources.id })
      .from(resources)
      .where(eq(resources.id, params.data))
      .limit(1);

    if (!resource) {
      return reply.code(404).send({
        status: "error",
        message: "Resource not found",
      });
    }

    const result = await app.db
      .select()
      .from(slots)
      .where(eq(slots.resourceId, params.data))
      .orderBy(slots.startAt);

    return {
      status: "success",
      slots: result,
    };
  });
};

export default slotRoutes;
