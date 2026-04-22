import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}.`);
    });
  } catch (error) {
    logger.error("Failed to start server.", {
      error: error instanceof Error ? error.message : "Unknown startup error",
    });

    process.exit(1);
  }
};

void startServer();
