import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { users } from "../src/infrastructure/database/schema/index.js";

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

const app = buildApp();

const randEmail = `${randomUUID()}@example.com`;
const randPassword = "Password123";
const randName = "Chinmoy TEST";
let accessToken: string;

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await (app as any).db.delete(users).where(eq(users.email, randEmail)).execute();
  await app.close();
});

describe("Auth endpoints", () => {
  it("should register a new user", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: randEmail,
        password: randPassword,
        name: randName,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("name", randName);
    expect(body).toHaveProperty("email", randEmail);
    expect(body).toHaveProperty("accessToken");
    accessToken = body.accessToken;
  });
  it("should not register an existing user", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: randEmail,
        password: randPassword,
        name: randName,
      },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body).toHaveProperty("message", "User already exists");
  });
  it("should not login with invalid credentials", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: randEmail,
        password: "wrongpassword",
      },
    });

    expect(response.statusCode).toBe(401);
    const body = response.json();
    expect(body).toHaveProperty("message", "Invalid email or password");
  });
  it("should login an existing user", async () => {
    const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
            email: randEmail,
            password: randPassword,
        }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.user.id).toBe(body.user.id);
    expect(body.user.name).toBe(randName);
    expect(body.user.email).toBe(randEmail);
    expect(body).toHaveProperty("accessToken");
    
  });
  it("should get the current user", async () => {
    const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty("status", "success");
    expect(body.user).toHaveProperty("id");
    expect(body.user).toHaveProperty("role");
  });
  it("should return 401 for unauthorized access to /auth/me", async () => {
    const response = await app.inject({
        method: "GET",
        url: "/auth/me",
    });

    expect(response.statusCode).toBe(401);
    const body = response.json();
    expect(body).toHaveProperty("status", "error");
    expect(body).toHaveProperty("message", "Unauthorized");
  });
});
