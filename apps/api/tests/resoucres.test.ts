import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { buildApp } from "../src/app.js";
import type { FastifyInstance } from "fastify";

import { createTestUser, cleanupTestData, authHeader } from "./helper.js";

describe("Resource API", () => {
  let app: FastifyInstance;

  let adminToken: string;
  let customerToken: string;

  let adminId: string;
  let customerId: string;

  const resourceIds: string[] = [];

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    const admin = await createTestUser(app, "ADMIN");
    const customer = await createTestUser(app, "CUSTOMER");

    adminToken = admin.token;
    customerToken = customer.token;

    adminId = admin.user.id;
    customerId = customer.user.id;
  });

  afterAll(async () => {
    await cleanupTestData(app, resourceIds, [adminId, customerId]);

    await app.close();
  });

  describe("POST /resources", () => {
    it("should create a resource as an admin", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/resources",
        headers: authHeader(adminToken),
        payload: {
          name: "Test Restaurant",
          description: "A test resource",
          location: "Delhi",
        },
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();

      expect(body.status).toBe("success");
      expect(body.resource).toBeDefined();
      expect(body.resource.id).toBeDefined();
      expect(body.resource.name).toBe("Test Restaurant");
      expect(body.resource.description).toBe("A test resource");
      expect(body.resource.location).toBe("Delhi");
      expect(body.resource.status).toBe("ACTIVE");

      resourceIds.push(body.resource.id);
    });

    it("should reject unauthenticated requests", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/resources",
        payload: {
          name: "Unauthorized Resource",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject customer requests", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/resources",
        headers: authHeader(customerToken),
        payload: {
          name: "Customer Resource",
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("should reject a missing name", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/resources",
        headers: authHeader(adminToken),
        payload: {
          description: "Missing name",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject a name shorter than 2 characters", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/resources",
        headers: authHeader(adminToken),
        payload: {
          name: "A",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject a name longer than 150 characters", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/resources",
        headers: authHeader(adminToken),
        payload: {
          name: "A".repeat(151),
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject an excessively long description", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/resources",
        headers: authHeader(adminToken),
        payload: {
          name: "Valid Resource",
          description: "A".repeat(2001),
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject an excessively long location", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/resources",
        headers: authHeader(adminToken),
        payload: {
          name: "Valid Resource",
          location: "A".repeat(256),
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject an empty request body", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/resources",
        headers: authHeader(adminToken),
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it("should create a resource without optional fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/resources",
        headers: authHeader(adminToken),
        payload: {
          name: "Minimal Resource",
        },
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();

      expect(body.resource.name).toBe("Minimal Resource");
      expect(body.resource.status).toBe("ACTIVE");

      resourceIds.push(body.resource.id);
    });
  });

  describe("GET /resources", () => {
    it("should list active resources publicly", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/resources",
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();

      expect(body.status).toBe("success");
      expect(Array.isArray(body.resources)).toBe(true);
    });

    it("should include resources created during this test", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/resources",
      });

      const body = response.json();

      const found = body.resources.some((resource: { id: string }) =>
        resourceIds.includes(resource.id),
      );

      expect(found).toBe(true);
    });
  });
});
