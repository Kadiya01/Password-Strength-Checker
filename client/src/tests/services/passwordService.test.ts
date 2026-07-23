import { describe, it, expect, vi, beforeEach } from "vitest";
import { passwordService, calculateLocalStrength } from "@/services/passwordService";

vi.mock("@/services/api", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import api from "@/services/api";
const mockApi = vi.mocked(api);

describe("calculateLocalStrength", () => {
  it("should return 0 score for empty password", () => {
    const result = calculateLocalStrength("");
    expect(result.score).toBe(0);
    expect(result.label).toBe("Very Weak");
    expect(result.details.length).toBe(0);
  });

  it("should return high score for strong password", () => {
    const result = calculateLocalStrength("MyStr0ng!P@ssw0rd#2024");
    expect(result.score).toBeGreaterThan(50);
    expect(result.details.hasUppercase).toBe(true);
    expect(result.details.hasLowercase).toBe(true);
    expect(result.details.hasNumbers).toBe(true);
    expect(result.details.hasSymbols).toBe(true);
  });

  it("should detect missing character types", () => {
    const result = calculateLocalStrength("lowercase");
    expect(result.details.hasUppercase).toBe(false);
    expect(result.details.hasNumbers).toBe(false);
    expect(result.details.hasSymbols).toBe(false);
  });

  it("should calculate correct entropy", () => {
    const result = calculateLocalStrength("abc");
    expect(result.details.entropy).toBeGreaterThan(0);
    expect(result.details.length).toBe(3);
  });
});

describe("passwordService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkStrength", () => {
    it("should return analysis result", async () => {
      mockApi.post.mockResolvedValue({
        data: { success: true, data: { score: 80, strength: "Strong" } },
      });
      const result = await passwordService.checkStrength("MyP@ssw0rd");
      expect(result.score).toBe(80);
    });
  });

  describe("generate", () => {
    it("should return generated password", async () => {
      mockApi.post.mockResolvedValue({
        data: { success: true, data: { password: "Generated123!" } },
      });
      const result = await passwordService.generate({ length: 16 });
      expect(result.password).toBeTruthy();
    });
  });

  describe("generatePassphrase", () => {
    it("should return passphrase", async () => {
      mockApi.post.mockResolvedValue({
        data: { success: true, data: { passphrase: "word1-word2-word3" } },
      });
      const result = await passwordService.generatePassphrase({ words: 3 });
      expect(result.passphrase).toBeTruthy();
    });
  });

  describe("getHistory", () => {
    it("should return paginated history", async () => {
      mockApi.get.mockResolvedValue({
        data: { success: true, data: { data: [], total: 0 } },
      });
      const result = await passwordService.getHistory(1, 10);
      expect(result).toBeDefined();
    });
  });

  describe("clearHistory", () => {
    it("should be a no-op without error", async () => {
      await expect(passwordService.clearHistory()).resolves.toBeUndefined();
    });
  });
});
