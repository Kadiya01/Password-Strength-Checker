import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import crypto from "crypto";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { corsConfig } from "@/config/cors.config";
import { config } from "@/config/index";
import swaggerOptions from "@/config/swagger.config";
import { rateLimiter } from "@/middleware/rateLimit.middleware";
import { errorHandler } from "@/middleware/errorHandler.middleware";
import { notFoundHandler } from "@/middleware/notFound.middleware";
import { routes } from "@/routes";

export function createApp(): express.Express {
  const app = express();

  // Trust proxy (configurable, defaults to 1 for reverse proxy support)
  app.set("trust proxy", config.TRUST_PROXY);

  // Request ID middleware
  app.use((_req, res, next) => {
    const requestId = crypto.randomUUID();
    _req.headers["x-request-id"] = requestId;
    res.setHeader("X-Request-ID", requestId);
    next();
  });

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

  // Logging (skip sensitive paths in production)
  app.use(morgan("combined", {
    skip: (req) => req.path === "/api/health",
  }));

  // Swagger Documentation (disabled in production)
  if (config.NODE_ENV !== "production") {
    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Password Strength Checker API Docs",
    }));

    // Swagger JSON endpoint
    app.get("/api/docs.json", (_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });
  }

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
    });
  });

  // API routes
  app.use("/api", routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
