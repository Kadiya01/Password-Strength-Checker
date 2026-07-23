import {
  PasswordChart,
  ChartData,
  ActivityHeatmapData,
} from "@/interfaces";
import { dashboardRepository } from "@/repositories/dashboard.repository";

export class AnalyticsService {
  async getChartData(userId: string): Promise<PasswordChart> {
    const [distribution, logsByDate, loginByDate] = await Promise.all([
      dashboardRepository.getStrengthDistribution(userId),
      dashboardRepository.getPasswordLogsByDate(userId, 30),
      dashboardRepository.getLoginHistoryByDate(userId, 30),
    ]);

    const strengthDistribution = this.buildStrengthDistributionChart(distribution);
    const strengthOverTime = this.buildStrengthOverTimeChart(logsByDate);
    const activityHeatmap = this.buildActivityHeatmap(loginByDate);

    return {
      strengthDistribution,
      strengthOverTime,
      activityHeatmap,
    };
  }

  private buildStrengthDistributionChart(distribution: {
    weak: number;
    fair: number;
    strong: number;
    veryStrong: number;
  }): ChartData {
    return {
      labels: ["Weak", "Fair", "Strong", "Very Strong"],
      datasets: [
        {
          label: "Password Strength Distribution",
          data: [distribution.weak, distribution.fair, distribution.strong, distribution.veryStrong],
          backgroundColor: [
            "rgba(239, 68, 68, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(59, 130, 246, 0.8)",
          ],
          borderColor: [
            "rgb(239, 68, 68)",
            "rgb(245, 158, 11)",
            "rgb(34, 197, 94)",
            "rgb(59, 130, 246)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }

  private buildStrengthOverTimeChart(logs: { strengthScore: number; createdAt: Date }[]): ChartData {
    const dailyData: Record<string, { count: number; totalScore: number }> = {};

    for (const log of logs) {
      const date = log.createdAt.toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = { count: 0, totalScore: 0 };
      }
      dailyData[date].count += 1;
      dailyData[date].totalScore += log.strengthScore;
    }

    const sortedDates = Object.keys(dailyData).sort();
    const labels = sortedDates;
    const avgScores = sortedDates.map((date) => {
      const data = dailyData[date];
      return Math.round(data.totalScore / data.count);
    });
    const counts = sortedDates.map((date) => dailyData[date].count);

    return {
      labels,
      datasets: [
        {
          label: "Average Strength Score",
          data: avgScores,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderWidth: 2,
        },
        {
          label: "Password Checks",
          data: counts,
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderWidth: 2,
        },
      ],
    };
  }

  private buildActivityHeatmap(logins: { success: boolean; createdAt: Date }[]): ActivityHeatmapData {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const data: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

    for (const login of logins) {
      const day = login.createdAt.getDay();
      const hour = login.createdAt.getHours();
      data[day][hour] += 1;
    }

    return { hours, days, data };
  }

  async getPasswordGenerationStats(userId: string) {
    const logs = await dashboardRepository.getPasswordLogsByDate(userId, 30);

    // Calculate generation statistics
    const totalGenerated = logs.length;
    const averageScore = totalGenerated > 0
      ? Math.round(logs.reduce((sum: number, log: { strengthScore: number }) => sum + log.strengthScore, 0) / totalGenerated)
      : 0;
    const averageEntropy = totalGenerated > 0
      ? Math.round(logs.reduce((sum: number, log: { strengthScore: number }) => sum + (log.strengthScore / 100) * 128, 0) / totalGenerated * 10) / 10
      : 0;

    // Calculate strength breakdown
    const strengthBreakdown = {
      weak: 0,
      fair: 0,
      strong: 0,
      veryStrong: 0,
    };

    for (const log of logs) {
      const score = log.strengthScore;
      if (score <= 30) strengthBreakdown.weak += 1;
      else if (score <= 60) strengthBreakdown.fair += 1;
      else if (score <= 80) strengthBreakdown.strong += 1;
      else strengthBreakdown.veryStrong += 1;
    }

    return {
      totalGenerated,
      averageScore,
      averageEntropy,
      strengthBreakdown,
      recentGenerations: logs.slice(0, 10).map((log: { strengthScore: number; createdAt: Date }) => ({
        score: log.strengthScore,
        createdAt: log.createdAt,
      })),
    };
  }
}

export const analyticsService = new AnalyticsService();
