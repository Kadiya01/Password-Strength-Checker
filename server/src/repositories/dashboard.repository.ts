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

  async getAverageEntropy(userId: string) {
    const result = await prisma.passwordLog.aggregate({
      where: { userId },
      _avg: { entropy: true },
    });
    return Math.round((result._avg.entropy ?? 0) * 10) / 10;
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
        userAgent: true,
        success: true,
        failureReason: true,
        createdAt: true,
      },
    });
  }

  async getLoginHistory(userId: string, skip: number, limit: number, startDate?: Date, endDate?: Date) {
    const where: Record<string, unknown> = { userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
    }

    const [data, total] = await Promise.all([
      prisma.loginHistory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          success: true,
          failureReason: true,
          createdAt: true,
        },
      }),
      prisma.loginHistory.count({ where }),
    ]);

    return { data, total };
  }

  async getSecurityEvents(userId: string, skip: number, limit: number, eventType?: string) {
    const where: Record<string, unknown> = { userId };
    if (eventType) where.eventType = eventType;

    const [data, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          eventType: true,
          ipAddress: true,
          userAgent: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.securityEvent.count({ where }),
    ]);

    return { data, total };
  }

  async getActivityTimeline(userId: string, skip: number, limit: number, type?: string) {
    const loginWhere: Record<string, unknown> = { userId };
    const passwordWhere: Record<string, unknown> = { userId };
    const securityWhere: Record<string, unknown> = { userId };

    if (type === "login" || !type) {
      // Will include logins
    } else {
      // Skip logins
    }

    const includeLogins = !type || type === "login";
    const includePasswords = !type || type === "password_check";
    const includeSecurity = !type || type === "security_event";

    const queries: Promise<{ id: string; type: string; description: string; ipAddress?: string; success?: boolean; createdAt: Date }[]>[] = [];

    if (includeLogins) {
      queries.push(
        prisma.loginHistory.findMany({
          where: loginWhere,
          orderBy: { createdAt: "desc" },
          take: limit * 2,
          select: {
            id: true,
            ipAddress: true,
            success: true,
            createdAt: true,
          },
        }).then((logins: { id: string; ipAddress: string; success: boolean; createdAt: Date }[]) =>
          logins.map((l) => ({
            id: l.id,
            type: "login" as const,
            description: l.success ? "Successful login" : "Failed login",
            ipAddress: l.ipAddress,
            success: l.success,
            createdAt: l.createdAt,
          }))
        )
      );
    }

    if (includePasswords) {
      queries.push(
        prisma.passwordLog.findMany({
          where: passwordWhere,
          orderBy: { createdAt: "desc" },
          take: limit * 2,
          select: {
            id: true,
            strengthScore: true,
            strengthLabel: true,
            createdAt: true,
          },
        }).then((logs: { id: string; strengthScore: number; strengthLabel: string; createdAt: Date }[]) =>
          logs.map((l) => ({
            id: l.id,
            type: "password_check" as const,
            description: `Password checked: ${l.strengthLabel} (Score: ${l.strengthScore})`,
            createdAt: l.createdAt,
          }))
        )
      );
    }

    if (includeSecurity) {
      queries.push(
        prisma.securityEvent.findMany({
          where: securityWhere,
          orderBy: { createdAt: "desc" },
          take: limit * 2,
          select: {
            id: true,
            eventType: true,
            ipAddress: true,
            createdAt: true,
          },
        }).then((events: { id: string; eventType: string; ipAddress: string | null; createdAt: Date }[]) =>
          events.map((e) => ({
            id: e.id,
            type: "security_event" as const,
            description: `Security event: ${e.eventType}`,
            ipAddress: e.ipAddress,
            createdAt: e.createdAt,
          }))
        )
      );
    }

    const results = await Promise.all(queries);
    const allItems = results.flat();
    allItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = allItems.length;
    const paginatedItems = allItems.slice(skip, skip + limit);

    return { data: paginatedItems, total };
  }

  async getPasswordLogs(userId: string, skip: number, limit: number, startDate?: Date, endDate?: Date) {
    const where: Record<string, unknown> = { userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
    }

    const [data, total] = await Promise.all([
      prisma.passwordLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.passwordLog.count({ where }),
    ]);

    return { data, total };
  }

  async getPasswordLogsForExport(userId: string, startDate?: Date, endDate?: Date) {
    const where: Record<string, unknown> = { userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
    }

    return prisma.passwordLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async getLoginHistoryForExport(userId: string, startDate?: Date, endDate?: Date) {
    const where: Record<string, unknown> = { userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
    }

    return prisma.loginHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async getSecurityEventsForExport(userId: string, startDate?: Date, endDate?: Date) {
    const where: Record<string, unknown> = { userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
    }

    return prisma.securityEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

  async getPasswordLogsByDate(userId: string, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.passwordLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
      select: {
        strengthScore: true,
        createdAt: true,
      },
    });

    return logs;
  }

  async getLoginHistoryByDate(userId: string, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return prisma.loginHistory.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
      select: {
        success: true,
        createdAt: true,
      },
    });
  }

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        lastLoginAt: true,
        isLocked: true,
        failedAttempts: true,
      },
    });
  }
}

export const dashboardRepository = new DashboardRepository();
