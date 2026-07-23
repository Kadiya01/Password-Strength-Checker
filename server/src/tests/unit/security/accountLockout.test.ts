jest.mock("@/config", () => ({
  config: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MS: 900000,
  },
}));

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: { findUnique: jest.fn(), update: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock("@/config/database.config", () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn(), update: jest.fn() },
  },
}));

import { handleFailedLogin, handleSuccessfulLogin, isAccountLocked } from "@/security/accountLockout";
import prisma from "@/config/database.config";

const mockPrisma = jest.mocked(prisma);

describe("accountLockout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleFailedLogin", () => {
    it("should increment failed attempts atomically", async () => {
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({ failedAttempts: 3 });

      await handleFailedLogin("user-123");

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { failedAttempts: { increment: 1 } },
        select: { failedAttempts: true },
      });
    });

    it("should lock account when max attempts reached", async () => {
      (mockPrisma.user.update as jest.Mock)
        .mockResolvedValueOnce({ failedAttempts: 5 })
        .mockResolvedValueOnce({});

      await handleFailedLogin("user-123");

      expect(mockPrisma.user.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.user.update).toHaveBeenNthCalledWith(1, {
        where: { id: "user-123" },
        data: { failedAttempts: { increment: 1 } },
        select: { failedAttempts: true },
      });
      expect(mockPrisma.user.update).toHaveBeenNthCalledWith(2, {
        where: { id: "user-123" },
        data: {
          isLocked: true,
          lockUntil: expect.any(Date),
        },
      });
    });

    it("should not lock when below max attempts", async () => {
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({ failedAttempts: 3 });

      await handleFailedLogin("user-123");

      expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
    });

    it("should handle DB errors silently", async () => {
      (mockPrisma.user.update as jest.Mock).mockRejectedValue(new Error("DB error"));

      await expect(handleFailedLogin("user-123")).resolves.toBeUndefined();
    });
  });

  describe("handleSuccessfulLogin", () => {
    it("should reset failed attempts and lock status", async () => {
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({});

      await handleSuccessfulLogin("user-123");

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          failedAttempts: 0,
          isLocked: false,
          lockUntil: null,
          lastLoginAt: expect.any(Date),
        },
      });
    });
  });

  describe("isAccountLocked", () => {
    it("should return false if user not found", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await isAccountLocked("nonexistent");

      expect(result).toBe(false);
    });

    it("should return false if user is not locked", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        isLocked: false,
        lockUntil: null,
      });

      const result = await isAccountLocked("user-123");

      expect(result).toBe(false);
    });

    it("should return true if account is locked and lock time not expired", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        isLocked: true,
        lockUntil: new Date(Date.now() + 600000),
      });

      const result = await isAccountLocked("user-123");

      expect(result).toBe(true);
    });

    it("should unlock account and return false if lock time expired", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        isLocked: true,
        lockUntil: new Date(Date.now() - 1000),
      });
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await isAccountLocked("user-123");

      expect(result).toBe(false);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { isLocked: false, lockUntil: null, failedAttempts: 0 },
      });
    });

    it("should return false on DB error (never crash)", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"));

      const result = await isAccountLocked("user-123");

      expect(result).toBe(false);
    });
  });
});
