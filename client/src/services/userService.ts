import api from "./api";
import type { UserProfile, UpdateProfileInput } from "@/types/user.types";
import type { ApiResponse } from "@/types/api.types";

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const { data } = await api.get<ApiResponse<UserProfile>>("/users/profile");
    if (!data.data) throw new Error(data.message || "Failed to retrieve profile");
    return data.data;
  },

  async updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
    const { data } = await api.put<ApiResponse<UserProfile>>("/users/profile", input);
    if (!data.data) throw new Error(data.message || "Failed to update profile");
    return data.data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    const { data } = await api.put<ApiResponse<void>>("/auth/change-password", payload);
    if (!data.success) throw new Error(data.message || "Failed to change password");
  },
};
