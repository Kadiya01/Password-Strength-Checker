import request from "supertest";
import { getApp } from "../helpers/appInstance";

const app = getApp();

describe("POST /api/password/generate (enhanced)", () => {
  it("should return password with entropy, strength, crackTime, and score", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data).toHaveProperty("password");
    expect(res.body.data).toHaveProperty("entropy");
    expect(res.body.data).toHaveProperty("strengthLabel");
    expect(res.body.data).toHaveProperty("crackTime");
    expect(res.body.data).toHaveProperty("score");
    expect(res.body.data).toHaveProperty("strength");
    expect(typeof res.body.data.password).toBe("string");
    expect(typeof res.body.data.entropy).toBe("number");
    expect(typeof res.body.data.score).toBe("number");
    expect(typeof res.body.data.crackTime).toBe("string");
    expect(["Strong", "Excellent"]).toContain(res.body.data.strengthLabel);
  });

  it("should generate a password of specified length", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({ length: 32 });

    expect(res.status).toBe(200);
    expect(res.body.data.password.length).toBe(32);
  });

  it("should generate with minimum length 8", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({ length: 8 });

    expect(res.status).toBe(200);
    expect(res.body.data.password.length).toBe(8);
  });

  it("should generate with maximum length 64", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({ length: 64 });

    expect(res.status).toBe(200);
    expect(res.body.data.password.length).toBe(64);
  });

  it("should reject length below 8", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({ length: 7 });

    expect(res.status).toBe(400);
  });

  it("should reject length above 64", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({ length: 65 });

    expect(res.status).toBe(400);
  });

  it("should generate with only uppercase enabled", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({
        includeUppercase: true,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.password).toMatch(/^[A-Z]+$/);
  });

  it("should generate with excludeAmbiguous", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({
        excludeAmbiguous: true,
        length: 32,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.password).not.toMatch(/[O0Il1|{}\[\]]/);
  });

  it("should return strength result with full details", async () => {
    const res = await request(app)
      .post("/api/password/generate")
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.data.strength).toHaveProperty("score");
    expect(res.body.data.strength).toHaveProperty("label");
    expect(res.body.data.strength).toHaveProperty("details");
    expect(res.body.data.strength).toHaveProperty("recommendations");
  });

  it("should always return score >= 75 (Strong or Excellent)", async () => {
    for (let i = 0; i < 20; i++) {
      const res = await request(app)
        .post("/api/password/generate")
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.data.score).toBeGreaterThanOrEqual(75);
    }
  });
});

describe("POST /api/password/generate-passphrase", () => {
  it("should generate a passphrase with default options", async () => {
    const res = await request(app)
      .post("/api/password/generate-passphrase")
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Passphrase generated");
    expect(res.body.data).toBeDefined();
    expect(res.body.data).toHaveProperty("passphrase");
    expect(res.body.data).toHaveProperty("entropy");
    expect(res.body.data).toHaveProperty("strength");
    expect(res.body.data).toHaveProperty("crackTime");
    expect(typeof res.body.data.passphrase).toBe("string");
    expect(typeof res.body.data.entropy).toBe("number");
  });

  it("should generate a passphrase with 5 words (default)", async () => {
    const res = await request(app)
      .post("/api/password/generate-passphrase")
      .send({});

    expect(res.status).toBe(200);
    const words = res.body.data.passphrase.split("-");
    expect(words.length).toBe(5);
  });

  it("should generate a passphrase with 4 words", async () => {
    const res = await request(app)
      .post("/api/password/generate-passphrase")
      .send({ words: 4 });

    expect(res.status).toBe(200);
    const words = res.body.data.passphrase.split("-");
    expect(words.length).toBe(4);
  });

  it("should generate a passphrase with 8 words", async () => {
    const res = await request(app)
      .post("/api/password/generate-passphrase")
      .send({ words: 8 });

    expect(res.status).toBe(200);
    const words = res.body.data.passphrase.split("-");
    expect(words.length).toBe(8);
  });

  it("should use space separator", async () => {
    const res = await request(app)
      .post("/api/password/generate-passphrase")
      .send({ words: 5, separator: " " });

    expect(res.status).toBe(200);
    const words = res.body.data.passphrase.split(" ");
    expect(words.length).toBe(5);
  });

  it("should use underscore separator", async () => {
    const res = await request(app)
      .post("/api/password/generate-passphrase")
      .send({ words: 5, separator: "_" });

    expect(res.status).toBe(200);
    const words = res.body.data.passphrase.split("_");
    expect(words.length).toBe(5);
  });

  it("should reject word count below 4", async () => {
    const res = await request(app)
      .post("/api/password/generate-passphrase")
      .send({ words: 3 });

    expect(res.status).toBe(400);
  });

  it("should reject word count above 8", async () => {
    const res = await request(app)
      .post("/api/password/generate-passphrase")
      .send({ words: 9 });

    expect(res.status).toBe(400);
  });

  it("should reject invalid separator", async () => {
    const res = await request(app)
      .post("/api/password/generate-passphrase")
      .send({ separator: "invalid" });

    expect(res.status).toBe(400);
  });

  it("should include entropy as a number", async () => {
    const res = await request(app)
      .post("/api/password/generate-passphrase")
      .send({ words: 5 });

    expect(res.status).toBe(200);
    expect(typeof res.body.data.entropy).toBe("number");
    expect(res.body.data.entropy).toBeGreaterThan(0);
  });
});
