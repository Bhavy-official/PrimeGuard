import { PrismaClient } from "@prisma/client";

import { env } from "./env";
import { logger } from "./logger";

declare global {
  // eslint-disable-next-line no-var
  var __PRISMA_CLIENT__: PrismaClient | undefined;
}

export const prisma =
  global.__PRISMA_CLIENT__ ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? [{ emit: "stdout", level: "error" }, { emit: "stdout", level: "warn" }]
        : [{ emit: "stdout", level: "error" }],
  });

if (env.NODE_ENV === "development") {
  global.__PRISMA_CLIENT__ = prisma;
  logger.debug("Prisma client initialized in development mode.");
}
