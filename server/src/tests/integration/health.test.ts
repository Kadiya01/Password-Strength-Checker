import request from "supertest";
import { getApp } from "../helpers/appInstance";

const app = getApp();

describe("GET /api/health", () => {
  it("should return 200 with status ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("environment");
  });

  it("should return a valid ISO timestamp", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    const timestamp = new Date(res.body.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  it("should return numeric uptime", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(typeof res.body.uptime).toBe("number");
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });
});
