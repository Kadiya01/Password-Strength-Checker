import prisma from "@/config/database.config";

export class PasswordRepository {
  async createLog(data: {
    userId: string;
    strengthScore: number;
    strengthLabel: string;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSymbols: boolean;
    entropy: number;
  }) {
    return prisma.passwordLog.create({ data });
  }

  async getLogsByUser(userId: string, skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.passwordLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.passwordLog.count({ where: { userId } }),
    ]);

    return { data, total };
  }

  async getTotalCount(userId: string) {
    return prisma.passwordLog.count({ where: { userId } });
  }

  async getAverageStrength(userId: string) {
    const result = await prisma.passwordLog.aggregate({
      where: { userId },
      _avg: { strengthScore: true },
    });
    return result._avg.strengthScore ?? 0;
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
}

export const passwordRepository = new PasswordRepository();
