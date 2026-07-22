import { config } from "@/config";
import prisma from "@/config/database.config";

export async function handleFailedLogin(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const newAttempts = user.failedAttempts + 1;

  if (newAttempts >= config.MAX_LOGIN_ATTEMPTS) {
    const lockUntil = new Date(Date.now() + config.LOCKOUT_DURATION_MS);
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedAttempts: newAttempts,
        isLocked: true,
        lockUntil,
      },
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { failedAttempts: newAttempts },
    });
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
}
