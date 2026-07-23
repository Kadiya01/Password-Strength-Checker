import { Request, Response, NextFunction } from "express";
import { ApiError, ValidationError, BadRequestError, UnauthorizedError } from "@/utils/ApiError";

jest.mock("@/utils/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import { errorHandler } from "@/middleware/errorHandler.middleware";
import { logger } from "@/utils/logger";

const mockLogger = jest.mocked(logger);

function createMockReq(): Request {
  return {} as Request;
}

function createMockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

function createMockNext(): NextFunction {
  return jest.fn();
}

describe("errorHandler middleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = createMockReq();
    res = createMockRes();
    next = createMockNext();
    jest.clearAllMocks();
  });

  it("should handle ApiError with correct status and message", () => {
    const error = new BadRequestError("Invalid input");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid input",
    });
  });

  it("should handle UnauthorizedError with 401", () => {
    const error = new UnauthorizedError("Not authenticated");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not authenticated",
    });
  });

  it("should handle ValidationError with 422 and errors array", () => {
    const errors = [
      { field: "email", message: "Invalid email" },
      { field: "password", message: "Too short" },
    ];
    const error = new ValidationError(errors);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      errors,
    });
  });

  it("should handle Prisma P2002 (unique constraint) as 409", () => {
    const error = new Error("Unique constraint failed");
    (error as any).code = "P2002";

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "A record with this value already exists",
    });
  });

  it("should handle Prisma P2025 (not found) as 404", () => {
    const error = new Error("Record not found");
    (error as any).code = "P2025";

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Resource not found",
    });
  });

  it("should handle JsonWebTokenError as 401", () => {
    const error = new Error("invalid token");
    error.name = "JsonWebTokenError";

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token",
    });
  });

  it("should handle TokenExpiredError as 401", () => {
    const error = new Error("jwt expired");
    error.name = "TokenExpiredError";

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token expired",
    });
  });

  it("should handle unknown errors as 500", () => {
    const error = new Error("Something unexpected");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });

  it("should log the error", () => {
    const error = new Error("Test error");

    errorHandler(error, req, res, next);

    expect(mockLogger.error).toHaveBeenCalledWith("Test error", expect.any(String));
  });

  it("should not include errors in ValidationError response when array is empty", () => {
    const error = new ValidationError([]);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall).not.toHaveProperty("errors");
  });
});
