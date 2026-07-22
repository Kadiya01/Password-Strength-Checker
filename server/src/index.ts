import { createApp } from "./app";
import { config } from "@/config";
import { logger } from "@/utils/logger";
import prisma from "@/config/database.config";

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");

    const app = createApp();

    app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info(`API Documentation: http://localhost:${config.PORT}/api/docs`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }

  process.on("SIGTERM", () => {
    logger.info("SIGTERM received - shutting down gracefully");
    void prisma.$disconnect().then(() => process.exit(0));
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT received - shutting down gracefully");
    void prisma.$disconnect().then(() => process.exit(0));
  });
}

void bootstrap();
