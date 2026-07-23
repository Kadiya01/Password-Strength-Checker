import { Request, Response, NextFunction } from "express";
import { authorize } from "@/middleware/authorize.middleware";

function createMockReqWithUser(role?: string): Request {
  return {
    user: role !== undefined ? { id: "user-123", email: "test@example.com", role } : undefined,
  } as unknown as Request;
}

function createMockRes(): Response {
  return {} as Response;
}

function createMockNext(): NextFunction {
  return jest.fn();
}

describe("authorize middleware", () => {
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    res = createMockRes();
    next = createMockNext();
  });

  it("should call next when user has correct role", () => {
    const middleware = authorize("USER");
    const req = createMockReqWithUser("USER");

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should return 403 when user has wrong role", () => {
    const middleware = authorize("ADMIN");
    const req = createMockReqWithUser("USER");

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: "Insufficient permissions",
      }),
    );
  });

  it("should allow access when user role is in multiple allowed roles", () => {
    const middleware = authorize("USER", "ADMIN", "MODERATOR");
    const req = createMockReqWithUser("ADMIN");

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should return 403 when no role in JWT (req.user exists but no role)", () => {
    const middleware = authorize("USER");
    const req = {
      user: { id: "user-123", email: "test@example.com", role: undefined },
    } as unknown as Request;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: "Insufficient permissions",
      }),
    );
  });

  it("should return 403 when req.user is undefined (no auth)", () => {
    const middleware = authorize("USER");
    const req = {
      user: undefined,
    } as unknown as Request;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: "Authentication required",
      }),
    );
  });

  it("should allow access with first role in allowed list", () => {
    const middleware = authorize("USER", "ADMIN");
    const req = createMockReqWithUser("USER");

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should deny access when allowed roles list is empty", () => {
    const middleware = authorize();
    const req = createMockReqWithUser("USER");

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
      }),
    );
  });
});
