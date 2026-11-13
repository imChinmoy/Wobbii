import { users } from "../../infrastructure/database/schema/index.js";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import argon2 from "argon2";
import { eq } from "drizzle-orm";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});
const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid request body" });
    }
    const { name, email, password } = parsed.data;

    const normalizedEmail = email.toLowerCase();

    const existingUser = await app.db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .execute();

    if (existingUser.length > 0) {
      return reply.code(400).send({ message: "User already exists" });
    }

    const passwordHash = await argon2.hash(password);

    try {
      const [newUser] = await app.db
        .insert(users)
        .values({
          name,
          email: normalizedEmail,
          passwordHash,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        });
      const accessToken = app.jwt.sign({
        sub: newUser.id,
        role: newUser.role,
      });

      return reply.code(201).send({ ...newUser, accessToken });
    } catch (error) {
      app.log.error({ err: error }, "Error creating user");
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        return reply.code(409).send({
          status: "error",
          message: "Email already registered",
        });
      }

      throw error;
    }
  });

  app.post("/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: "error",
        message: "Invalid login data",
      });
    }

    const { email, password } = parsed.data;

    const [user] = await app.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return reply.code(401).send({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await argon2.verify(user.passwordHash, password);

    if (!passwordMatches) {
      return reply.code(401).send({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const accessToken = await reply.jwtSign({
      sub: user.id,
      role: user.role,
    });

    return reply.send({
      status: "success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  });
  app.get("/me", { preHandler: [app.authenticate] }, async (request) => ({
    status: "success",
    user: {
      id: request.user.sub,
      role: request.user.role,
    },
  }));
};

export default authRoutes;
