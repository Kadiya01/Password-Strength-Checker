import { ApiError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, LockedError, ValidationError } from "@/utils/ApiError";

describe("ApiError", () => {
  it("should create an ApiError with correct properties", () => {
    const error = new ApiError(400, "Bad request");
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Bad request");
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
  });

  it("should set isOperational to false when specified", () => {
    const error = new ApiError(500, "Internal error", false);
    expect(error.isOperational).toBe(false);
  });
});

describe("Custom Error Classes", () => {
  it("BadRequestError should return 400", () => {
    const error = new BadRequestError("Invalid input");
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Invalid input");
  });

  it("BadRequestError should use default message", () => {
    const error = new BadRequestError();
    expect(error.message).toBe("Bad request");
  });

  it("UnauthorizedError should return 401", () => {
    const error = new UnauthorizedError("Not authenticated");
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Not authenticated");
  });

  it("ForbiddenError should return 403", () => {
    const error = new ForbiddenError("No access");
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("No access");
  });

  it("NotFoundError should return 404", () => {
    const error = new NotFoundError("Missing");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Missing");
  });

  it("ConflictError should return 409", () => {
    const error = new ConflictError("Duplicate");
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe("Duplicate");
  });

  it("LockedError should return 423", () => {
    const error = new LockedError("Locked out");
    expect(error.statusCode).toBe(423);
    expect(error.message).toBe("Locked out");
  });

  it("ValidationError should return 422 with errors array", () => {
    const errors = [{ field: "email", message: "Invalid" }];
    const error = new ValidationError(errors);
    expect(error.statusCode).toBe(422);
    expect(error.errors).toEqual(errors);
  });

  it("all error classes should be instance of ApiError", () => {
    expect(new BadRequestError()).toBeInstanceOf(ApiError);
    expect(new UnauthorizedError()).toBeInstanceOf(ApiError);
    expect(new ForbiddenError()).toBeInstanceOf(ApiError);
    expect(new NotFoundError()).toBeInstanceOf(ApiError);
    expect(new ConflictError()).toBeInstanceOf(ApiError);
    expect(new LockedError()).toBeInstanceOf(ApiError);
    expect(new ValidationError([])).toBeInstanceOf(ApiError);
  });
});
