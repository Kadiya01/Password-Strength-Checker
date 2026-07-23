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
    expect(res.body.data).toHaveProperty("strength");
    expect(res.body.data).toHaveProperty("checks");
    expect(res.body.data).toHaveProperty("suggestions");
    expect(res.body.data).toHaveProperty("entropy");
    expect(res.body.data).toHaveProperty("crackTime");
    expect(res.body.data).toHaveProperty("passphrase");
  });

  it("should return correct checks structure", async () => {
    const res = await request(app)
      .post("/api/password/check-strength")
      .send({ password: "Abc123!@" });

    expect(res.status).toBe(200);
    expect(res.body.data.checks).toHaveProperty("uppercase");
    expect(res.body.data.checks).toHaveProperty("lowercase");
    expect(res.body.data.checks).toHaveProperty("numbers");
    expect(res.body.data.checks).toHaveProperty("symbols");
    expect(res.body.data.checks).toHaveProperty("length");
    expect(res.body.data.checks).toHaveProperty("dictionary");
    expect(res.body.data.checks).toHaveProperty("keyboardPattern");
    expect(res.body.data.checks).toHaveProperty("sequence");
    expect(res.body.data.checks).toHaveProperty("repeated");
    expect(typeof res.body.data.entropy).toBe("number");
    expect(res.body.data.entropy).toBeGreaterThan(0);
  });

  it("should detect weak passwords as Very Weak", async () => {
    const res = await request(app)
      .post("/api/password/check-strength")
      .send({ password: "password" });

    expect(res.status).toBe(200);
    expect(res.body.data.strength).toBe("Very Weak");
    expect(res.body.data.checks.dictionary).toBe(true);
  });

  it("should detect strong passwords", async () => {
    const res = await request(app)
      .post("/api/password/check-strength")
      .send({ password: "Xk9#mP2$vL7nQ!4w" });

    expect(res.status).toBe(200);
    expect(res.body.data.score).toBeGreaterThanOrEqual(70);
    expect(res.body.data.checks.dictionary).toBe(false);
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
      .send({ length: 64 });

    expect(res.status).toBe(200);
    expect(res.body.data.password.length).toBe(64);
  });
});
