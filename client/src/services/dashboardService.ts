import api from "./api";
import type {
  DashboardStatistics,
  SecurityScore,
  LoginActivity,
  PasswordAnalytics,
  PasswordChart,
  ActivityTimelineItem,
  SecurityEventRecord,
  PaginatedResult,
} from "@/types/dashboard.types";
import type { ApiResponse } from "@/types/api.types";

export const dashboardService = {
  async getStatistics(): Promise<DashboardStatistics> {
    const { data } = await api.get<ApiResponse<DashboardStatistics>>("/dashboard/statistics");
    if (!data.data) throw new Error(data.message || "Failed to fetch dashboard statistics");
    return data.data;
  },

  async getSecurityScore(): Promise<SecurityScore> {
    const { data } = await api.get<ApiResponse<SecurityScore>>("/dashboard/security-score");
    if (!data.data) throw new Error(data.message || "Failed to fetch security score");
    return data.data;
  },

  async getLoginHistory(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResult<LoginActivity>> {
    const { data } = await api.get<ApiResponse<PaginatedResult<LoginActivity>>>("/dashboard/login-history", { params });
    if (!data.data) throw new Error(data.message || "Failed to fetch login history");
    return data.data;
  },

  async getSecurityEvents(params?: {
    page?: number;
    limit?: number;
    eventType?: string;
  }): Promise<PaginatedResult<SecurityEventRecord>> {
    const { data } = await api.get<ApiResponse<PaginatedResult<SecurityEventRecord>>>("/dashboard/security-events", { params });
    if (!data.data) throw new Error(data.message || "Failed to fetch security events");
    return data.data;
  },

  async getActivityTimeline(params?: {
    page?: number;
    limit?: number;
    type?: "login" | "password_check" | "security_event" | "registration";
  }): Promise<PaginatedResult<ActivityTimelineItem>> {
    const { data } = await api.get<ApiResponse<PaginatedResult<ActivityTimelineItem>>>("/dashboard/activity-timeline", { params });
    if (!data.data) throw new Error(data.message || "Failed to fetch activity timeline");
    return data.data;
  },

  async getPasswordAnalytics(): Promise<PasswordAnalytics> {
    const { data } = await api.get<ApiResponse<PasswordAnalytics>>("/dashboard/password-analytics");
    if (!data.data) throw new Error(data.message || "Failed to fetch password analytics");
    return data.data;
  },

  async getChartData(): Promise<PasswordChart> {
    const { data } = await api.get<ApiResponse<PasswordChart>>("/dashboard/chart-data");
    if (!data.data) throw new Error(data.message || "Failed to fetch chart data");
    return data.data;
  },

  async getGenerationStats(): Promise<{ totalGenerated: number; byType: { standard: number; passphrase: number } }> {
    const { data } = await api.get<ApiResponse<{ totalGenerated: number; byType: { standard: number; passphrase: number } }>>("/dashboard/generation-stats");
    if (!data.data) throw new Error(data.message || "Failed to fetch generation stats");
    return data.data;
  },

  async exportData(params?: {
    format?: "csv" | "json";
    type?: "password_logs" | "login_history" | "security_events";
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const { data } = await api.get("/dashboard/export", {
      params,
      responseType: "blob",
    });
    return data;
  },
};
