import request from "supertest";
import { getApp } from "../helpers/appInstance";
import prisma from "@/config/database.config";

const app = getApp();

const TEST_USER = {
  email: `dashboard-test-${Date.now()}@example.com`,
  username: `dashboardtestuser${Date.now()}`,
  password: "Str0ng!Pass#2024",
  firstName: "Dashboard",
  lastName: "Tester",
};

let accessToken: string;
let userId: string;

async function cleanupUser(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.securityEvent.deleteMany({ where: { userId: user.id } });
      await prisma.loginHistory.deleteMany({ where: { userId: user.id } });
      await prisma.passwordLog.deleteMany({ where: { userId: user.id } });
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  } catch {
    // ignore cleanup errors
  }
}

beforeAll(async () => {
  await cleanupUser(TEST_USER.email);

  // Register user
  const registerRes = await request(app)
    .post("/api/auth/register")
    .send(TEST_USER);

  expect(registerRes.status).toBe(201);
  accessToken = registerRes.body.data.accessToken;
  userId = registerRes.body.data.user.id;

  // Add some test data
  // Create password logs
  await prisma.passwordLog.createMany({
    data: [
      {
        userId,
        strengthScore: 25,
        strengthLabel: "Weak",
        hasUppercase: false,
        hasLowercase: true,
        hasNumbers: true,
        hasSymbols: false,
        entropy: 32.5,
      },
      {
        userId,
        strengthScore: 55,
        strengthLabel: "Fair",
        hasUppercase: true,
        hasLowercase: true,
        hasNumbers: true,
        hasSymbols: false,
        entropy: 58.2,
      },
      {
        userId,
        strengthScore: 85,
        strengthLabel: "Strong",
        hasUppercase: true,
        hasLowercase: true,
        hasNumbers: true,
        hasSymbols: true,
        entropy: 89.7,
      },
    ],
  });

  // Create login history
  await prisma.loginHistory.createMany({
    data: [
      {
        userId,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        success: true,
      },
      {
        userId,
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        success: true,
      },
      {
        userId,
        ipAddress: "10.0.0.50",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
        success: false,
        failureReason: "Invalid password",
      },
    ],
  });

  // Create security events
  await prisma.securityEvent.createMany({
    data: [
      {
        userId,
        eventType: "login_success",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      {
        userId,
        eventType: "login_failed",
        ipAddress: "10.0.0.50",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
        metadata: { reason: "Invalid password" },
      },
    ],
  });
});

afterAll(async () => {
  await cleanupUser(TEST_USER.email);
  await prisma.$disconnect();
});

describe("Dashboard - Statistics", () => {
  it("should retrieve dashboard statistics", async () => {
    const res = await request(app)
      .get("/api/dashboard/statistics")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("totalPasswordsChecked");
    expect(res.body.data).toHaveProperty("averageStrength");
    expect(res.body.data).toHaveProperty("strengthDistribution");
    expect(res.body.data).toHaveProperty("recentActivity");
    expect(res.body.data).toHaveProperty("securityScore");
    expect(res.body.data.totalPasswordsChecked).toBe(3);
    expect(typeof res.body.data.securityScore).toBe("number");
  });

  it("should return 401 without authentication", async () => {
    const res = await request(app)
      .get("/api/dashboard/statistics");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("Dashboard - Security Score", () => {
  it("should retrieve security score with factors and recommendations", async () => {
    const res = await request(app)
      .get("/api/dashboard/security-score")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("overall");
    expect(res.body.data).toHaveProperty("factors");
    expect(res.body.data).toHaveProperty("recommendations");
    expect(typeof res.body.data.overall).toBe("number");
    expect(Array.isArray(res.body.data.factors)).toBe(true);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
    expect(res.body.data.factors.length).toBeGreaterThan(0);

    // Check factor structure
    const factor = res.body.data.factors[0];
    expect(factor).toHaveProperty("name");
    expect(factor).toHaveProperty("score");
    expect(factor).toHaveProperty("weight");
    expect(factor).toHaveProperty("description");
  });

  it("should return 401 without authentication", async () => {
    const res = await request(app)
      .get("/api/dashboard/security-score");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("Dashboard - Login History", () => {
  it("should retrieve paginated login history", async () => {
    const res = await request(app)
      .get("/api/dashboard/login-history")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("total");
    expect(res.body.data).toHaveProperty("page");
    expect(res.body.data).toHaveProperty("limit");
    expect(Array.isArray(res.body.data.data)).toBe(true);
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.data.length).toBe(3);

    // Check login record structure
    const login = res.body.data.data[0];
    expect(login).toHaveProperty("id");
    expect(login).toHaveProperty("ipAddress");
    expect(login).toHaveProperty("userAgent");
    expect(login).toHaveProperty("success");
    expect(login).toHaveProperty("createdAt");
  });

  it("should filter login history by date range", async () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();

    const res = await request(app)
      .get(`/api/dashboard/login-history?startDate=${yesterday}&endDate=${today}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.data)).toBe(true);
  });

  it("should return 401 without authentication", async () => {
    const res = await request(app)
      .get("/api/dashboard/login-history");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("Dashboard - Security Events", () => {
  it("should retrieve paginated security events", async () => {
    const res = await request(app)
      .get("/api/dashboard/security-events")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("total");
    expect(res.body.data).toHaveProperty("page");
    expect(res.body.data).toHaveProperty("limit");
    expect(Array.isArray(res.body.data.data)).toBe(true);
    expect(res.body.data.total).toBe(2);

    // Check event structure
    const event = res.body.data.data[0];
    expect(event).toHaveProperty("id");
    expect(event).toHaveProperty("eventType");
    expect(event).toHaveProperty("ipAddress");
    expect(event).toHaveProperty("userAgent");
    expect(event).toHaveProperty("createdAt");
  });

  it("should filter security events by type", async () => {
    const res = await request(app)
      .get("/api/dashboard/security-events?eventType=login_success")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.data)).toBe(true);
    // All returned events should be login_success
    for (const event of res.body.data.data) {
      expect(event.eventType).toBe("login_success");
    }
  });

  it("should return 401 without authentication", async () => {
    const res = await request(app)
      .get("/api/dashboard/security-events");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("Dashboard - Activity Timeline", () => {
  it("should retrieve combined activity timeline", async () => {
    const res = await request(app)
      .get("/api/dashboard/activity-timeline")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("total");
    expect(Array.isArray(res.body.data.data)).toBe(true);
    expect(res.body.data.total).toBeGreaterThan(0);

    // Check timeline item structure
    const item = res.body.data.data[0];
    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("type");
    expect(item).toHaveProperty("description");
    expect(item).toHaveProperty("createdAt");
    expect(["login", "password_check", "security_event"]).toContain(item.type);
  });

  it("should filter timeline by type", async () => {
    const res = await request(app)
      .get("/api/dashboard/activity-timeline?type=login")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.data)).toBe(true);

    // All returned items should be login type
    for (const item of res.body.data.data) {
      expect(item.type).toBe("login");
    }
  });

  it("should return 401 without authentication", async () => {
    const res = await request(app)
      .get("/api/dashboard/activity-timeline");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("Dashboard - Password Analytics", () => {
  it("should retrieve password analytics with trends and patterns", async () => {
    const res = await request(app)
      .get("/api/dashboard/password-analytics")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("totalChecked");
    expect(res.body.data).toHaveProperty("averageStrength");
    expect(res.body.data).toHaveProperty("averageEntropy");
    expect(res.body.data).toHaveProperty("distribution");
    expect(res.body.data).toHaveProperty("trendOverTime");
    expect(res.body.data).toHaveProperty("topPatterns");
    expect(res.body.data.totalChecked).toBe(3);
    expect(Array.isArray(res.body.data.trendOverTime)).toBe(true);
    expect(Array.isArray(res.body.data.topPatterns)).toBe(true);

    // Check trend structure
    if (res.body.data.trendOverTime.length > 0) {
      const trend = res.body.data.trendOverTime[0];
      expect(trend).toHaveProperty("date");
      expect(trend).toHaveProperty("count");
      expect(trend).toHaveProperty("averageScore");
    }
  });

  it("should return 401 without authentication", async () => {
    const res = await request(app)
      .get("/api/dashboard/password-analytics");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("Dashboard - Chart Data", () => {
  it("should retrieve chart-ready data for visualization", async () => {
    const res = await request(app)
      .get("/api/dashboard/chart-data")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("strengthDistribution");
    expect(res.body.data).toHaveProperty("strengthOverTime");
    expect(res.body.data).toHaveProperty("activityHeatmap");

    // Check strength distribution chart
    const distChart = res.body.data.strengthDistribution;
    expect(distChart).toHaveProperty("labels");
    expect(distChart).toHaveProperty("datasets");
    expect(Array.isArray(distChart.labels)).toBe(true);
    expect(Array.isArray(distChart.datasets)).toBe(true);
    expect(distChart.labels.length).toBe(4); // Weak, Fair, Strong, Very Strong

    // Check heatmap structure
    const heatmap = res.body.data.activityHeatmap;
    expect(heatmap).toHaveProperty("hours");
    expect(heatmap).toHaveProperty("days");
    expect(heatmap).toHaveProperty("data");
    expect(Array.isArray(heatmap.hours)).toBe(true);
    expect(Array.isArray(heatmap.days)).toBe(true);
    expect(Array.isArray(heatmap.data)).toBe(true);
    expect(heatmap.hours.length).toBe(24);
    expect(heatmap.days.length).toBe(7);
  });

  it("should return 401 without authentication", async () => {
    const res = await request(app)
      .get("/api/dashboard/chart-data");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("Dashboard - Password Generation Stats", () => {
  it("should retrieve password generation statistics", async () => {
    const res = await request(app)
      .get("/api/dashboard/generation-stats")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("totalGenerated");
    expect(res.body.data).toHaveProperty("averageScore");
    expect(res.body.data).toHaveProperty("averageEntropy");
    expect(res.body.data).toHaveProperty("strengthBreakdown");
    expect(res.body.data).toHaveProperty("recentGenerations");
    expect(typeof res.body.data.totalGenerated).toBe("number");
    expect(Array.isArray(res.body.data.recentGenerations)).toBe(true);
  });

  it("should return 401 without authentication", async () => {
    const res = await request(app)
      .get("/api/dashboard/generation-stats");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("Dashboard - Export Data", () => {
  it("should export data as JSON by default", async () => {
    const res = await request(app)
      .get("/api/dashboard/export")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.headers["content-disposition"]).toContain("attachment");
    expect(res.headers["content-disposition"]).toContain(".json");

    // Parse the JSON data
    const data = JSON.parse(res.text);
    expect(Array.isArray(data)).toBe(true);
  });

  it("should export password logs as CSV", async () => {
    const res = await request(app)
      .get("/api/dashboard/export?format=csv&type=password_logs")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.headers["content-disposition"]).toContain("attachment");
    expect(res.headers["content-disposition"]).toContain(".csv");

    // Check CSV structure
    const lines = res.text.split("\n");
    expect(lines.length).toBeGreaterThan(1); // Header + at least one row
    expect(lines[0]).toContain("ID");
    expect(lines[0]).toContain("Strength Score");
  });

  it("should export login history as JSON", async () => {
    const res = await request(app)
      .get("/api/dashboard/export?format=json&type=login_history")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");

    const data = JSON.parse(res.text);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(3);
  });

  it("should export with date filtering", async () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();

    const res = await request(app)
      .get(`/api/dashboard/export?startDate=${yesterday}&endDate=${today}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");
  });

  it("should return 401 without authentication", async () => {
    const res = await request(app)
      .get("/api/dashboard/export");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("Dashboard - Edge Cases", () => {
  it("should handle pagination correctly", async () => {
    const res = await request(app)
      .get("/api/dashboard/login-history?page=1&limit=2")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBe(2);
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(2);
  });

  it("should handle empty results gracefully", async () => {
    // Create a new user with no data
    const emptyUser = {
      email: `empty-dashboard-${Date.now()}@example.com`,
      username: `emptydashuser${Date.now()}`,
      password: "Str0ng!Pass#2024",
    };

    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(emptyUser);

    expect(registerRes.status).toBe(201);
    const emptyToken = registerRes.body.data.accessToken;

    const res = await request(app)
      .get("/api/dashboard/statistics")
      .set("Authorization", `Bearer ${emptyToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalPasswordsChecked).toBe(0);
    expect(res.body.data.securityScore).toBe(50); // Default score for no data

    // Cleanup
    const user = await prisma.user.findUnique({ where: { email: emptyUser.email } });
    if (user) {
      await prisma.securityEvent.deleteMany({ where: { userId: user.id } });
      await prisma.loginHistory.deleteMany({ where: { userId: user.id } });
      await prisma.passwordLog.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  });
});
