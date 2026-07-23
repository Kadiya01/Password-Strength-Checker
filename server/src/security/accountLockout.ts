import { config } from "@/config";
import prisma from "@/config/database.config";

export async function handleFailedLogin(userId: string): Promise<void> {
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { failedAttempts: { increment: 1 } },
      select: { failedAttempts: true },
    });

    if (updated.failedAttempts >= config.MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + config.LOCKOUT_DURATION_MS);
      await prisma.user.update({
        where: { id: userId },
        data: { isLocked: true, lockUntil },
      });
    }
  } catch {
    // Silently handle DB errors during lockout to avoid crashing login flow
  }
}

export async function handleSuccessfulLogin(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedAttempts: 0,
      isLocked: false,
      lockUntil: null,
      lastLoginAt: new Date(),
    },
  });
}

export async function isAccountLocked(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isLocked: true, lockUntil: true },
    });

    if (!user || !user.isLocked) return false;

    if (user.lockUntil && user.lockUntil <= new Date()) {
      await prisma.user.update({
        where: { id: userId },
        data: { isLocked: false, lockUntil: null, failedAttempts: 0 },
      });
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
