import request from "supertest";
import { getApp } from "../helpers/appInstance";

const app = getApp();

describe("Auth Validation", () => {
  describe("POST /api/auth/register", () => {
    it("should return 400 when email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "testuser", password: "Password123!" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThan(0);
      expect(res.body.errors.some((e: { field: string }) => e.field === "email")).toBe(true);
    });

    it("should return 400 when username is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com", password: "Password123!" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e: { field: string }) => e.field === "username")).toBe(true);
    });

    it("should return 400 when password is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com", username: "testuser" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e: { field: string }) => e.field === "password")).toBe(true);
    });

    it("should return 400 when email is invalid", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "not-an-email", username: "testuser", password: "Password123!" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e: { field: string; message: string }) =>
        e.field === "email" && e.message.includes("Invalid email")
      )).toBe(true);
    });

    it("should return 400 when username is too short", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com", username: "ab", password: "Password123!" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e: { field: string }) => e.field === "username")).toBe(true);
    });

    it("should return 400 when password is too short", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com", username: "testuser", password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e: { field: string }) => e.field === "password")).toBe(true);
    });

    it("should return 400 when request body is empty", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 when email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ password: "Password123!" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e: { field: string }) => e.field === "email")).toBe(true);
    });

    it("should return 400 when password is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e: { field: string }) => e.field === "password")).toBe(true);
    });

    it("should return 400 when email is invalid", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "not-an-email", password: "Password123!" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should return 400 when email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when email is invalid", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "invalid" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("should return 400 when token is missing", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ newPassword: "NewPassword123!" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when newPassword is missing", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "some-token" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});

describe("Password Validation", () => {
  describe("POST /api/password/check-strength", () => {
    it("should return 400 when password is missing", async () => {
      const res = await request(app)
        .post("/api/password/check-strength")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e: { field: string }) => e.field === "password")).toBe(true);
    });

    it("should return 400 when password is empty string", async () => {
      const res = await request(app)
        .post("/api/password/check-strength")
        .send({ password: "" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/password/generate", () => {
    it("should return 400 when length is less than 8", async () => {
      const res = await request(app)
        .post("/api/password/generate")
        .send({ length: 4 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when length is greater than 128", async () => {
      const res = await request(app)
        .post("/api/password/generate")
        .send({ length: 200 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});

describe("404 Handler", () => {
  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Route not found");
  });

  it("should return 404 for unknown POST routes", async () => {
    const res = await request(app)
      .post("/api/unknown/endpoint")
      .send({});

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("Protected Routes", () => {
  it("should return 401 when accessing protected route without token", async () => {
    const res = await request(app).get("/api/users/profile");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", "Bearer invalid-token-here");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 for dashboard without token", async () => {
    const res = await request(app).get("/api/dashboard/statistics");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 for password history without token", async () => {
    const res = await request(app).get("/api/password/history");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
