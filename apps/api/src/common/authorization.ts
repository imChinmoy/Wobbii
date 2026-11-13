import type { preHandlerHookHandler } from "fastify";
import { userRoleEnum } from "../infrastructure/database/schema/users.js";

type UserRole = (typeof userRoleEnum.enumValues)[number];

export function requireRole(
  ...allowedRoles: UserRole[]
): preHandlerHookHandler {
  return async (request, reply) => {
    if (!allowedRoles.includes(request.user.role)) {
      return reply.code(403).send({
        status: "error",
        message: "Forbidden",
      });
    }
  };
}
