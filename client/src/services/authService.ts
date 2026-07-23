import api from "./api";
import type { AuthResponse, User } from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

export const authService = {
  async login(email: string, password: string, rememberMe = false): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/login", {
      email,
      password,
      rememberMe,
    });
    if (!data.data) throw new Error(data.message || "Login failed");
    return data.data;
  },

  async register(payload: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/register", payload);
    if (!data.data) throw new Error(data.message || "Registration failed");
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async refresh(): Promise<{ accessToken: string; user: User } | null> {
    try {
      const { data } = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>("/auth/refresh-token");
      if (!data.data) return null;
      const me = await authService.getMe();
      return { accessToken: data.data.accessToken, user: me };
    } catch {
      return null;
    }
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    if (!data.data) throw new Error(data.message || "Unable to fetch profile");
    return data.data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    const { data } = await api.put<ApiResponse<void>>("/auth/change-password", payload);
    if (!data.success) throw new Error(data.message || "Failed to change password");
  },

  async forgotPassword(email: string): Promise<void> {
    const { data } = await api.post<ApiResponse<void>>("/auth/forgot-password", { email });
    if (!data.success) throw new Error(data.message || "Failed to send reset email");
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const { data } = await api.post<ApiResponse<void>>("/auth/reset-password", { token, newPassword });
    if (!data.success) throw new Error(data.message || "Failed to reset password");
  },
};
