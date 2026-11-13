import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { buildApp } from "../src/app.js";
import type { FastifyInstance } from "fastify";

import {
  createTestUser,
  createTestResource,
  cleanupTestData,
  authHeader,
} from "./helper.js";

describe("Slot API", () => {
  let app: FastifyInstance;

  let adminToken: string;
  let customerToken: string;

  let adminId: string;
  let customerId: string;

  let resourceId: string;
  let secondResourceId: string;
  let inactiveResourceId: string;

  const resourceIds: string[] = [];

  const validSlot = {
    startAt: "2030-05-15T10:00:00.000Z",
    endAt: "2030-05-15T11:00:00.000Z",
    capacity: 10,
  };

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    const admin = await createTestUser(app, "ADMIN");
    const customer = await createTestUser(app, "CUSTOMER");

    adminToken = admin.token;
    customerToken = customer.token;

    adminId = admin.user.id;
    customerId = customer.user.id;

    const resource = await createTestResource(app);
    const secondResource = await createTestResource(app);
    const inactiveResource = await createTestResource(app, "INACTIVE");

    resourceId = resource.id;
    secondResourceId = secondResource.id;
    inactiveResourceId = inactiveResource.id;

    resourceIds.push(resourceId, secondResourceId, inactiveResourceId);
  });

  afterAll(async () => {
    await cleanupTestData(app, resourceIds, [adminId, customerId]);

    await app.close();
  });

  describe("POST /resources/:resourceId/slots", () => {
    it("should create a slot as an admin", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        headers: authHeader(adminToken),
        payload: validSlot,
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();

      expect(body.status).toBe("success");
      expect(body.slot).toBeDefined();
      expect(body.slot.id).toBeDefined();
      expect(body.slot.resourceId).toBe(resourceId);
      expect(body.slot.capacity).toBe(10);
      expect(body.slot.allocatedCount).toBe(0);
      expect(body.slot.status).toBe("OPEN");

      expect(new Date(body.slot.startAt).toISOString()).toBe(validSlot.startAt);

      expect(new Date(body.slot.endAt).toISOString()).toBe(validSlot.endAt);
    });

    it("should reject unauthenticated requests", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        payload: validSlot,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject customer requests", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        headers: authHeader(customerToken),
        payload: validSlot,
      });

      expect(response.statusCode).toBe(403);
    });

    it("should reject an invalid resource UUID", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/resources/not-a-uuid/slots",
        headers: authHeader(adminToken),
        payload: validSlot,
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 404 for a nonexistent resource", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/00000000-0000-4000-8000-000000000000/slots`,
        headers: authHeader(adminToken),
        payload: validSlot,
      });

      expect(response.statusCode).toBe(404);
    });

    it("should reject slot creation for an inactive resource", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/${inactiveResourceId}/slots`,
        headers: authHeader(adminToken),
        payload: validSlot,
      });

      expect(response.statusCode).toBe(404);
    });

    it("should reject a zero capacity", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        headers: authHeader(adminToken),
        payload: {
          ...validSlot,
          capacity: 0,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject a negative capacity", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        headers: authHeader(adminToken),
        payload: {
          ...validSlot,
          capacity: -5,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject a decimal capacity", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        headers: authHeader(adminToken),
        payload: {
          ...validSlot,
          capacity: 2.5,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject a capacity greater than the configured maximum", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        headers: authHeader(adminToken),
        payload: {
          ...validSlot,
          capacity: 10001,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject a missing capacity", async () => {
      const { capacity, ...payload } = validSlot;

      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        headers: authHeader(adminToken),
        payload,
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject a missing start time", async () => {
      const { startAt, ...payload } = validSlot;

      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        headers: authHeader(adminToken),
        payload,
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject an invalid date", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        headers: authHeader(adminToken),
        payload: {
          ...validSlot,
          startAt: "not-a-date",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject an end time before the start time", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        headers: authHeader(adminToken),
        payload: {
          ...validSlot,
          startAt: "2030-05-15T12:00:00.000Z",
          endAt: "2030-05-15T11:00:00.000Z",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject equal start and end times", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        headers: authHeader(adminToken),
        payload: {
          ...validSlot,
          endAt: validSlot.startAt,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should not allow clients to set allocatedCount", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/resources/${resourceId}/slots`,
        headers: authHeader(adminToken),
        payload: {
          ...validSlot,
          allocatedCount: 5,
        },
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();

      expect(body.slot.allocatedCount).toBe(0);
    });
  });

  describe("GET /resources/:resourceId/slots", () => {
    it("should list slots publicly", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/resources/${resourceId}/slots`,
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();

      expect(body.status).toBe("success");
      expect(Array.isArray(body.slots)).toBe(true);
    });

    it("should reject an invalid resource UUID", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/resources/invalid-id/slots",
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 404 for a nonexistent resource", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/resources/00000000-0000-4000-8000-000000000000/slots",
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return slots belonging only to the requested resource", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/resources/${resourceId}/slots`,
      });

      const body = response.json();

      expect(
        body.slots.every(
          (slot: { resourceId: string }) => slot.resourceId === resourceId,
        ),
      ).toBe(true);
    });

    it("should order slots by start time ascending", async () => {
      await app.inject({
        method: "POST",
        url: `/resources/${secondResourceId}/slots`,
        headers: authHeader(adminToken),
        payload: {
          startAt: "2030-05-15T14:00:00.000Z",
          endAt: "2030-05-15T15:00:00.000Z",
          capacity: 5,
        },
      });

      await app.inject({
        method: "POST",
        url: `/resources/${secondResourceId}/slots`,
        headers: authHeader(adminToken),
        payload: {
          startAt: "2030-05-15T10:00:00.000Z",
          endAt: "2030-05-15T11:00:00.000Z",
          capacity: 5,
        },
      });

      const response = await app.inject({
        method: "GET",
        url: `/resources/${secondResourceId}/slots`,
      });

      expect(response.statusCode).toBe(200);

      const { slots: result } = response.json();

      const timestamps = result.map((slot: { startAt: string }) =>
        new Date(slot.startAt).getTime(),
      );

      expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
    });
  });
});
