import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = "test-access-secret-key-for-testing-32ch";

jest.mock("@/config/jwt.config", () => ({
  jwtConfig: {
    secret: "test-access-secret-key-for-testing-32ch",
  },
}));

import { authenticate } from "@/middleware/authenticate.middleware";

function createMockReq(authHeader?: string): Request {
  return {
    headers: {
      authorization: authHeader,
    },
    user: undefined,
  } as unknown as Request;
}

function createMockRes(): Response {
  return {} as Response;
}

describe("authenticate middleware", () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockNext = jest.fn();
  });

  it("should call next with user data for valid token", () => {
    const token = jwt.sign(
      { sub: "user-123", email: "test@example.com", role: "USER" },
      JWT_SECRET,
      { algorithm: "HS256" },
    );

    const req = createMockReq(`Bearer ${token}`);
    authenticate(req, createMockRes(), mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.user).toEqual({
      id: "user-123",
      email: "test@example.com",
      role: "USER",
    });
  });

  it("should return 401 when Authorization header is missing", () => {
    const req = createMockReq(undefined);
    authenticate(req, createMockRes(), mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Authentication required",
        statusCode: 401,
      }),
    );
  });

  it("should return 401 when Authorization header does not start with Bearer", () => {
    const req = createMockReq("Basic abc123");
    authenticate(req, createMockRes(), mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Authentication required",
        statusCode: 401,
      }),
    );
  });

  it("should return 401 for malformed token", () => {
    const req = createMockReq("Bearer not.a.valid.token");
    authenticate(req, createMockRes(), mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Invalid or expired token",
        statusCode: 401,
      }),
    );
  });

  it("should return 401 for expired token", () => {
    const token = jwt.sign(
      { sub: "user-123", email: "test@example.com", role: "USER" },
      JWT_SECRET,
      { expiresIn: "0s" },
    );

    const req = createMockReq(`Bearer ${token}`);
    authenticate(req, createMockRes(), mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Invalid or expired token",
        statusCode: 401,
      }),
    );
  });

  it("should return 401 for invalid signature", () => {
    const token = jwt.sign(
      { sub: "user-123", email: "test@example.com", role: "USER" },
      "wrong-secret",
      { algorithm: "HS256" },
    );

    const req = createMockReq(`Bearer ${token}`);
    authenticate(req, createMockRes(), mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Invalid or expired token",
        statusCode: 401,
      }),
    );
  });

  it("should set user data from token payload", () => {
    const token = jwt.sign(
      { sub: "admin-456", email: "admin@example.com", role: "ADMIN" },
      JWT_SECRET,
      { algorithm: "HS256" },
    );

    const req = createMockReq(`Bearer ${token}`);
    authenticate(req, createMockRes(), mockNext);

    expect(req.user).toEqual({
      id: "admin-456",
      email: "admin@example.com",
      role: "ADMIN",
    });
  });
});
