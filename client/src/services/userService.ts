import api from "./api";
import type { UserProfile, UpdateProfileInput } from "@/types/user.types";
import type { ApiResponse } from "@/types/api.types";

export const userService = {
  async getProfile(): Promise<UserProfile> {
    try {
      const { data } = await api.get<ApiResponse<UserProfile>>("/users/profile");
      if (data.data) return data.data;
    } catch {
      // Offline fallback
      return {
        id: 1,
        username: "sentinel_user",
        email: "security_officer@sentinel.org",
        firstName: "Secure",
        lastName: "User",
        role: "user",
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      };
    }
    throw new Error("Unable to fetch user profile");
  },

  async updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
    try {
      const { data } = await api.put<ApiResponse<UserProfile>>("/users/profile", input);
      if (data.data) return data.data;
    } catch {
      // Offline fallback
      return {
        id: 1,
        username: input.username || "sentinel_user",
        email: input.email || "security_officer@sentinel.org",
        firstName: input.firstName || "Secure",
        lastName: input.lastName || "User",
        role: "user",
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      };
    }
    throw new Error("Unable to update user profile");
  },
};
