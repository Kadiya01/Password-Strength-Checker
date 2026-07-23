import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { corsConfig } from "@/config/cors.config";
import swaggerOptions from "@/config/swagger.config";
import { rateLimiter } from "@/middleware/rateLimit.middleware";
import { errorHandler } from "@/middleware/errorHandler.middleware";
import { notFoundHandler } from "@/middleware/notFound.middleware";
import { routes } from "@/routes";

export function createApp(): express.Express {
  const app = express();

  // Trust first proxy (for rate limiting and IP logging behind reverse proxy)
  app.set("trust proxy", 1);

  // Security headers
  app.use(helmet());
  app.use(cors(corsConfig));

  // Add Vary: Origin header for proper caching with CORS
  app.use((_req, res, next) => {
    res.setHeader("Vary", "Origin");
    next();
  });

  app.use(rateLimiter);

  // Compression
  app.use(compression());

  // Parsing
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
  app.use(cookieParser());

  // Logging
  app.use(morgan("combined"));

  // Swagger Documentation
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Password Strength Checker API Docs",
  }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV ?? "development",
    });
  });

  // Swagger JSON endpoint
  app.get("/api/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // API routes
  app.use("/api", routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
