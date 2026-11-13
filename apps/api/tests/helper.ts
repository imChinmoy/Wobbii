import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { eq, inArray } from "drizzle-orm";

import { users } from "../src/infrastructure/database/schema/users.js";
import { resources } from "../src/infrastructure/database/schema/resources.js";
import { slots } from "../src/infrastructure/database/schema/slots.js";

export async function createTestUser(
  app: FastifyInstance,
  role: "CUSTOMER" | "ADMIN" = "CUSTOMER",
) {
  const email = `test-${randomUUID()}@example.com`;

  const [user] = await (app as any).db
    .insert(users)
    .values({
      name: "Test User",
      email,
      passwordHash: "test-password-hash",
      role,
    })
    .returning({
      id: users.id,
      email: users.email,
    });

  const token = app.jwt.sign({
    sub: user.id,
    role,
  });

  return { user, token };
}

export async function createTestResource(
  app: FastifyInstance,
  status: "ACTIVE" | "INACTIVE" = "ACTIVE",
) {
  const [resource] = await (app as any).db
    .insert(resources)
    .values({
      name: `Test Resource ${randomUUID()}`,
      description: "Created for integration testing",
      location: "Test Location",
      status,
    })
    .returning();

  return resource;
}

export async function cleanupTestData(
  app: FastifyInstance,
  resourceIds: string[],
  userIds: string[],
) {
  if (resourceIds.length > 0) {
    await (app as any).db.delete(slots).where(inArray(slots.resourceId, resourceIds));

    await (app as any).db.delete(resources).where(inArray(resources.id, resourceIds));
  }

  if (userIds.length > 0) {
    await (app as any).db.delete(users).where(inArray(users.id, userIds));
  }
}

export function authHeader(token: string) {
  return {
    authorization: `Bearer ${token}`,
  };
}
