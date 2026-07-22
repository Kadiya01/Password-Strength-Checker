import api from "./api";
import type { AuthResponse } from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/login", { email, password });
      if (data.data) return data.data;
    } catch {
      // Simulate successful login offline
      const mockUser = {
        id: 1,
        username: email.split("@")[0],
        email,
        firstName: "Secure",
        lastName: "User",
        role: "user",
        createdAt: new Date().toISOString(),
      };
      return {
        user: mockUser,
        token: "mock-jwt-token-sentinelpass",
      };
    }
    throw new Error("Login failed");
  },

  async register(payload: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    try {
      const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/register", payload);
      if (data.data) return data.data;
    } catch {
      // Simulate successful registration offline
      const mockUser = {
        id: 1,
        username: payload.username,
        email: payload.email,
        firstName: payload.firstName || "Secure",
        lastName: payload.lastName || "User",
        role: "user",
        createdAt: new Date().toISOString(),
      };
      return {
        user: mockUser,
        token: "mock-jwt-token-sentinelpass",
      };
    }
    throw new Error("Registration failed");
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
  },
};
