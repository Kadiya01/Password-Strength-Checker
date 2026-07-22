import request from "supertest";
import { getApp } from "../helpers/appInstance";

const app = getApp();

describe("POST /api/password/check-strength", () => {
  it("should check password strength with valid input", async () => {
    const res = await request(app)
      .post("/api/password/check-strength")
      .send({ password: "TestPassword123!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Password strength analyzed");
    expect(res.body.data).toBeDefined();
    expect(res.body.data).toHaveProperty("score");
    expect(res.body.data).toHaveProperty("label");
    expect(res.body.data).toHaveProperty("details");
    expect(res.body.data).toHaveProperty("recommendations");
  });

  it("should return correct details structure", async () => {
    const res = await request(app)
      .post("/api/password/check-strength")
      .send({ password: "Abc123!@" });

    expect(res.status).toBe(200);
    expect(res.body.data.details).toHaveProperty("hasUppercase");
    expect(res.body.data.details).toHaveProperty("hasLowercase");
    expect(res.body.data.details).toHaveProperty("hasNumbers");
    expect(res.body.data.details).toHaveProperty("hasSymbols");
    expect(res.body.data.details).toHaveProperty("length");
    expect(res.body.data.details).toHaveProperty("entropy");
  });

  it("should work without authentication (anonymous check)", async () => {
    const res = await request(app)
      .post("/api/password/check-strength")
      .send({ password: "anonymous_check" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("POST /api/password/generate", () => {
  it("should generate a password with default options", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Password generated");
    expect(res.body.data).toBeDefined();
    expect(res.body.data).toHaveProperty("password");
    expect(res.body.data).toHaveProperty("strength");
    expect(typeof res.body.data.password).toBe("string");
    expect(res.body.data.password.length).toBe(16);
  });

  it("should generate a password with custom length", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({ length: 32 });

    expect(res.status).toBe(200);
    expect(res.body.data.password.length).toBe(32);
  });

  it("should generate a password with minimum length", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({ length: 8 });

    expect(res.status).toBe(200);
    expect(res.body.data.password.length).toBe(8);
  });

  it("should generate a password with maximum length", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({ length: 128 });

    expect(res.status).toBe(200);
    expect(res.body.data.password.length).toBe(128);
  });
});
