import {
  DashboardStatistics,
  SecurityScore,
  SecurityScoreFactor,
  ActivityTimelineQuery,
  LoginHistoryQuery,
  SecurityEventsQuery,
  PasswordAnalytics,
} from "@/interfaces";
import { dashboardRepository } from "@/repositories/dashboard.repository";
import { parsePagination } from "@/interfaces";

export class DashboardService {
  async getStatistics(userId: string): Promise<DashboardStatistics> {
    const [totalPasswordsChecked, averageStrength, strengthDistribution, recentActivity, securityScore] =
      await Promise.all([
        dashboardRepository.getTotalPasswordsChecked(userId),
        dashboardRepository.getAverageStrength(userId),
        dashboardRepository.getStrengthDistribution(userId),
        dashboardRepository.getRecentLogins(userId, 10),
        dashboardRepository.getSecurityScore(userId),
      ]);

    return {
      totalPasswordsChecked,
      averageStrength,
      strengthDistribution,
      recentActivity: recentActivity.map((entry: { id: string; ipAddress: string; userAgent: string; success: boolean; failureReason: string | null; createdAt: Date }) => ({
        id: entry.id,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        success: entry.success,
        failureReason: entry.failureReason ?? undefined,
        createdAt: entry.createdAt,
      })),
      securityScore,
    };
  }

  async getSecurityScore(userId: string): Promise<SecurityScore> {
    const [overallScore, user, recentLogins] = await Promise.all([
      dashboardRepository.getSecurityScore(userId),
      dashboardRepository.getUserById(userId),
      dashboardRepository.getRecentLogins(userId, 20),
    ]);

    const factors: SecurityScoreFactor[] = [];
    const recommendations: string[] = [];

    // Factor 1: Login success rate
    const successfulLogins = recentLogins.filter((l: { success: boolean }) => l.success).length;
    const loginSuccessRate = recentLogins.length > 0 ? Math.round((successfulLogins / recentLogins.length) * 100) : 100;
    factors.push({
      name: "Login Success Rate",
      score: loginSuccessRate,
      weight: 0.3,
      description: `${successfulLogins}/${recentLogins.length} recent logins successful`,
    });

    if (loginSuccessRate < 80) {
      recommendations.push("Improve login success rate by using correct credentials");
    }

    // Factor 2: Account lockout status
    const lockoutScore = user?.isLocked ? 0 : 100;
    factors.push({
      name: "Account Lockout",
      score: lockoutScore,
      weight: 0.2,
      description: user?.isLocked ? "Account is currently locked" : "Account is active",
    });

    if (user?.isLocked) {
      recommendations.push("Account is locked. Wait for lockout period to expire or reset password");
    }

    // Factor 3: Failed attempts
    const failedAttemptsScore = Math.max(0, 100 - (user?.failedAttempts ?? 0) * 10);
    factors.push({
      name: "Failed Attempts",
      score: failedAttemptsScore,
      weight: 0.2,
      description: `${user?.failedAttempts ?? 0} recent failed login attempts`,
    });

    if ((user?.failedAttempts ?? 0) > 3) {
      recommendations.push("Multiple failed login attempts detected. Consider changing your password");
    }

    // Factor 4: Recent activity
    const recentActivityScore = recentLogins.length > 0 ? 100 : 50;
    factors.push({
      name: "Recent Activity",
      score: recentActivityScore,
      weight: 0.15,
      description: recentLogins.length > 0 ? "Active account with recent logins" : "No recent login activity",
    });

    // Factor 5: Password strength (if available)
    const averageStrength = await dashboardRepository.getAverageStrength(userId);
    const passwordStrengthScore = Math.min(100, averageStrength);
    factors.push({
      name: "Password Strength",
      score: passwordStrengthScore,
      weight: 0.15,
      description: `Average password strength score: ${averageStrength}`,
    });

    if (averageStrength < 60) {
      recommendations.push("Consider using stronger passwords with higher entropy");
    }

    if (recommendations.length === 0) {
      recommendations.push("Your account security looks good!");
    }

    return {
      overall: overallScore,
      factors,
      recommendations,
    };
  }

  async getLoginHistory(userId: string, query: LoginHistoryQuery) {
    const pagination = parsePagination(query);
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const { data, total } = await dashboardRepository.getLoginHistory(
      userId,
      pagination.skip,
      pagination.limit,
      startDate,
      endDate
    );

    return {
      data: data.map((entry: { id: string; ipAddress: string; userAgent: string; success: boolean; failureReason: string | null; createdAt: Date }) => ({
        id: entry.id,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        success: entry.success,
        failureReason: entry.failureReason ?? undefined,
        createdAt: entry.createdAt,
      })),
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async getSecurityEvents(userId: string, query: SecurityEventsQuery) {
    const pagination = parsePagination(query);

    const { data, total } = await dashboardRepository.getSecurityEvents(
      userId,
      pagination.skip,
      pagination.limit,
      query.eventType
    );

    return {
      data: data.map((event: { id: string; eventType: string; ipAddress: string; userAgent: string; metadata: unknown; createdAt: Date }) => ({
        id: event.id,
        eventType: event.eventType,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: event.metadata as Record<string, unknown> | undefined,
        createdAt: event.createdAt,
      })),
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async getActivityTimeline(userId: string, query: ActivityTimelineQuery) {
    const pagination = parsePagination(query);

    const { data, total } = await dashboardRepository.getActivityTimeline(
      userId,
      pagination.skip,
      pagination.limit,
      query.type
    );

    return {
      data: data.map((item: { id: string; type: string; description: string; ipAddress?: string; success?: boolean; createdAt: Date }) => ({
        id: item.id,
        type: item.type as "login" | "password_check" | "security_event" | "registration",
        description: item.description,
        ipAddress: item.ipAddress,
        success: item.success,
        createdAt: item.createdAt,
      })),
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async getPasswordAnalytics(userId: string): Promise<PasswordAnalytics> {
    const [totalChecked, averageStrength, averageEntropy, distribution, logsByDate] = await Promise.all([
      dashboardRepository.getTotalPasswordsChecked(userId),
      dashboardRepository.getAverageStrength(userId),
      dashboardRepository.getAverageEntropy(userId),
      dashboardRepository.getStrengthDistribution(userId),
      dashboardRepository.getPasswordLogsByDate(userId, 30),
    ]);

    // Calculate trend over time (last 30 days)
    const trendOverTime = this.calculatePasswordTrend(logsByDate);

    // Calculate top patterns
    const topPatterns = this.calculateTopPatterns(logsByDate);

    return {
      totalChecked,
      averageStrength,
      averageEntropy,
      distribution,
      trendOverTime,
      topPatterns,
    };
  }

  private calculatePasswordTrend(logs: { strengthScore: number; createdAt: Date }[]) {
    const dailyData: Record<string, { count: number; totalScore: number }> = {};

    for (const log of logs) {
      const date = log.createdAt.toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = { count: 0, totalScore: 0 };
      }
      dailyData[date].count += 1;
      dailyData[date].totalScore += log.strengthScore;
    }

    const trend: { date: string; count: number; averageScore: number }[] = [];
    const sortedDates = Object.keys(dailyData).sort();

    for (const date of sortedDates) {
      const data = dailyData[date];
      trend.push({
        date,
        count: data.count,
        averageScore: Math.round(data.totalScore / data.count),
      });
    }

    return trend;
  }

  private calculateTopPatterns(logs: { strengthScore: number; createdAt: Date }[]) {
    // Group by score ranges to identify patterns
    const patterns: Record<string, number> = {
      "Very Weak (0-20)": 0,
      "Weak (21-40)": 0,
      "Fair (41-60)": 0,
      "Strong (61-80)": 0,
      "Very Strong (81-100)": 0,
    };

    for (const log of logs) {
      const score = log.strengthScore;
      if (score <= 20) patterns["Very Weak (0-20)"] += 1;
      else if (score <= 40) patterns["Weak (21-40)"] += 1;
      else if (score <= 60) patterns["Fair (41-60)"] += 1;
      else if (score <= 80) patterns["Strong (61-80)"] += 1;
      else patterns["Very Strong (81-100)"] += 1;
    }

    const total = logs.length || 1;
    return Object.entries(patterns).map(([pattern, count]) => ({
      pattern,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }
}

export const dashboardService = new DashboardService();
