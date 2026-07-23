import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "@/services/authService";

vi.mock("@/services/api", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

import api from "@/services/api";
const mockApi = vi.mocked(api);

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should return auth response on success", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { user: { id: "1", email: "test@test.com" }, accessToken: "token123" },
        },
      };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.login("test@test.com", "password123");
      expect(result.accessToken).toBe("token123");
      expect(mockApi.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@test.com",
        password: "password123",
        rememberMe: false,
      });
    });

    it("should throw when response has no data", async () => {
      mockApi.post.mockResolvedValue({ data: { success: false, message: "Invalid" } });
      await expect(authService.login("a@b.com", "pass")).rejects.toThrow("Invalid");
    });
  });

  describe("register", () => {
    it("should return auth response on success", async () => {
      mockApi.post.mockResolvedValue({
        data: {
          success: true,
          data: { user: { id: "1" }, accessToken: "token" },
        },
      });

      const result = await authService.register({
        email: "test@test.com",
        username: "testuser",
        password: "StrongP@ss1",
      });
      expect(result.accessToken).toBe("token");
    });
  });

  describe("logout", () => {
    it("should call post to logout", async () => {
      mockApi.post.mockResolvedValue({ data: { success: true } });
      await authService.logout();
      expect(mockApi.post).toHaveBeenCalledWith("/auth/logout");
    });
  });

  describe("getMe", () => {
    it("should return user profile", async () => {
      const user = { id: "1", email: "test@test.com" };
      mockApi.get.mockResolvedValue({ data: { success: true, data: user } });

      const result = await authService.getMe();
      expect(result).toEqual(user);
    });

    it("should throw when no data", async () => {
      mockApi.get.mockResolvedValue({ data: { success: false } });
      await expect(authService.getMe()).rejects.toThrow();
    });
  });

  describe("forgotPassword", () => {
    it("should call post with email", async () => {
      mockApi.post.mockResolvedValue({ data: { success: true } });
      await authService.forgotPassword("test@test.com");
      expect(mockApi.post).toHaveBeenCalledWith("/auth/forgot-password", { email: "test@test.com" });
    });
  });
});
