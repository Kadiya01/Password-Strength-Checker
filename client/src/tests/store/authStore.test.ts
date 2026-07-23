import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types/auth.types";

const mockUser: User = {
  id: "user-123",
  email: "test@example.com",
  username: "testuser",
  firstName: "Test",
  lastName: "User",
  role: "USER",
};

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    localStorage.clear();
  });

  it("should have correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("setAuth should set user, token, and isAuthenticated", () => {
    useAuthStore.getState().setAuth(mockUser, "test-token-123");

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe("test-token-123");
    expect(state.isAuthenticated).toBe(true);
  });

  it("clearAuth should reset to initial state", () => {
    useAuthStore.getState().setAuth(mockUser, "test-token-123");
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("updateUser should update user fields", () => {
    useAuthStore.getState().setAuth(mockUser, "test-token-123");
    useAuthStore.getState().updateUser({ firstName: "Updated" });

    const state = useAuthStore.getState();
    expect(state.user?.firstName).toBe("Updated");
    expect(state.user?.email).toBe("test@example.com");
  });

  it("updateUser should not crash when user is null", () => {
    useAuthStore.getState().updateUser({ firstName: "Updated" });
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("should persist user and isAuthenticated to localStorage but exclude token", () => {
    useAuthStore.getState().setAuth(mockUser, "secret-token");

    const stored = localStorage.getItem("auth-storage");
    expect(stored).toBeTruthy();

    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.state.user).toEqual(mockUser);
      expect(parsed.state.isAuthenticated).toBe(true);
      expect(parsed.state.token).toBeUndefined();
    }
  });
});
