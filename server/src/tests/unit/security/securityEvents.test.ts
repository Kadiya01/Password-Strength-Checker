jest.mock("@prisma/client", () => {
  const mockPrisma = {
    securityEvent: { create: jest.fn() },
    loginHistory: { create: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock("@/config/database.config", () => ({
  __esModule: true,
  default: {
    securityEvent: { create: jest.fn() },
    loginHistory: { create: jest.fn() },
  },
}));

import { logSecurityEvent, logLoginHistory } from "@/security/securityEvents";
import prisma from "@/config/database.config";

const mockPrisma = jest.mocked(prisma);

describe("securityEvents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logSecurityEvent", () => {
    it("should create a DB record", async () => {
      (mockPrisma.securityEvent.create as jest.Mock).mockResolvedValue({});

      await logSecurityEvent("user-123", "LOGIN_SUCCESS", "127.0.0.1", "test-agent");

      expect(mockPrisma.securityEvent.create).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          eventType: "LOGIN_SUCCESS",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
        },
      });
    });

    it("should include metadata when provided", async () => {
      (mockPrisma.securityEvent.create as jest.Mock).mockResolvedValue({});

      await logSecurityEvent("user-123", "LOGIN_FAILURE", "127.0.0.1", "test-agent", {
        reason: "Invalid password",
      });

      expect(mockPrisma.securityEvent.create).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          eventType: "LOGIN_FAILURE",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          metadata: { reason: "Invalid password" },
        },
      });
    });

    it("should set metadata to undefined when not provided", async () => {
      (mockPrisma.securityEvent.create as jest.Mock).mockResolvedValue({});

      await logSecurityEvent("user-123", "LOGIN_SUCCESS", "127.0.0.1", "test-agent");

      const callData = (mockPrisma.securityEvent.create as jest.Mock).mock.calls[0][0].data;
      expect(callData.metadata).toBeUndefined();
    });

    it("should not throw when DB fails (security logging should never crash)", async () => {
      (mockPrisma.securityEvent.create as jest.Mock).mockRejectedValue(new Error("DB error"));

      await expect(
        logSecurityEvent("user-123", "LOGIN_SUCCESS", "127.0.0.1", "test-agent"),
      ).resolves.toBeUndefined();
    });
  });

  describe("logLoginHistory", () => {
    it("should create a DB record with success=true", async () => {
      (mockPrisma.loginHistory.create as jest.Mock).mockResolvedValue({});

      await logLoginHistory("user-123", "127.0.0.1", "test-agent", true);

      expect(mockPrisma.loginHistory.create).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          success: true,
        },
      });
    });

    it("should create a DB record with success=false and failureReason", async () => {
      (mockPrisma.loginHistory.create as jest.Mock).mockResolvedValue({});

      await logLoginHistory("user-123", "127.0.0.1", "test-agent", false, "Invalid password");

      expect(mockPrisma.loginHistory.create).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          success: false,
          failureReason: "Invalid password",
        },
      });
    });

    it("should set failureReason to undefined when not provided", async () => {
      (mockPrisma.loginHistory.create as jest.Mock).mockResolvedValue({});

      await logLoginHistory("user-123", "127.0.0.1", "test-agent", true);

      const callData = (mockPrisma.loginHistory.create as jest.Mock).mock.calls[0][0].data;
      expect(callData.failureReason).toBeUndefined();
    });

    it("should not throw when DB fails (security logging should never crash)", async () => {
      (mockPrisma.loginHistory.create as jest.Mock).mockRejectedValue(new Error("DB error"));

      await expect(
        logLoginHistory("user-123", "127.0.0.1", "test-agent", true),
      ).resolves.toBeUndefined();
    });
  });
});
