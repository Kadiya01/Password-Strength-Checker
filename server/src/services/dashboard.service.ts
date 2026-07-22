import { DashboardStatistics } from "@/interfaces";
import { dashboardRepository } from "@/repositories/dashboard.repository";

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
      recentActivity: recentActivity.map((entry: { id: string; ipAddress: string; success: boolean; createdAt: Date }) => ({
        id: entry.id,
        ipAddress: entry.ipAddress,
        success: entry.success,
        createdAt: entry.createdAt,
      })),
      securityScore,
    };
  }
}

export const dashboardService = new DashboardService();
