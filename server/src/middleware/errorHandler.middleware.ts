import { Request, Response, NextFunction } from "express";
import { ApiError, ValidationError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { logger } from "@/utils/logger";
import { config } from "@/config/index";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const isDev = config.NODE_ENV !== "production";
  logger.error(`${err.message}`, isDev ? err.stack : undefined);

  if (err instanceof ValidationError) {
    ApiResponse.error(res, err.statusCode, err.message, err.errors);
    return;
  }

  if (err instanceof ApiError) {
    ApiResponse.error(res, err.statusCode, err.message);
    return;
  }

  if (err.name === "JsonWebTokenError") {
    ApiResponse.error(res, 401, "Invalid token");
    return;
  }

  if (err.name === "TokenExpiredError") {
    ApiResponse.error(res, 401, "Token expired");
    return;
  }

  if (err.name === "MulterError") {
    const multerErr = err as unknown as { code: string; message: string };
    if (multerErr.code === "LIMIT_FILE_SIZE") {
      ApiResponse.error(res, 413, "File too large");
    } else {
      ApiResponse.error(res, 400, `Upload error: ${multerErr.message}`);
    }
    return;
  }

  const prismaCode = (err as { code?: string }).code;
  if (prismaCode === "P2025") {
    ApiResponse.error(res, 404, "Resource not found");
    return;
  }
  if (prismaCode === "P2002") {
    ApiResponse.error(res, 409, "A record with this value already exists");
    return;
  }

  ApiResponse.error(res, 500, "Internal server error");
}
