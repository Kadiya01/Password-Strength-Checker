import prisma from "@/config/database.config";

export class DashboardRepository {
  async getTotalPasswordsChecked(userId: string) {
    return prisma.passwordLog.count({ where: { userId } });
  }

  async getAverageStrength(userId: string) {
    const result = await prisma.passwordLog.aggregate({
      where: { userId },
      _avg: { strengthScore: true },
    });
    return Math.round(result._avg.strengthScore ?? 0);
  }

  async getStrengthDistribution(userId: string) {
    const logs = await prisma.passwordLog.groupBy({
      by: ["strengthLabel"],
      where: { userId },
      _count: { id: true },
    });

    const distribution = { weak: 0, fair: 0, strong: 0, veryStrong: 0 };
    for (const log of logs) {
      const label = log.strengthLabel.toLowerCase();
      if (label.includes("weak")) distribution.weak += log._count.id;
      else if (label.includes("fair")) distribution.fair += log._count.id;
      else if (label.includes("strong") && !label.includes("very")) distribution.strong += log._count.id;
      else if (label.includes("very")) distribution.veryStrong += log._count.id;
    }
    return distribution;
  }

  async getRecentLogins(userId: string, limit = 10) {
    return prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        ipAddress: true,
        success: true,
        createdAt: true,
      },
    });
  }

  async getSecurityScore(userId: string): Promise<number> {
    const recentLogins = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (recentLogins.length === 0) return 50;

    const successfulLogins = recentLogins.filter((entry: { success: boolean }) => entry.success).length;
    const successRate = (successfulLogins / recentLogins.length) * 100;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { failedAttempts: true, isLocked: true },
    });

    let score = Math.round(successRate);
    if (user && user.failedAttempts > 0) score -= user.failedAttempts * 5;
    if (user && user.isLocked) score -= 20;

    return Math.max(0, Math.min(100, score));
  }
}

export const dashboardRepository = new DashboardRepository();
