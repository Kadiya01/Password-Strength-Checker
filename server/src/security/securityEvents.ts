import prisma from "@/config/database.config";

export async function logSecurityEvent(
  userId: string,
  eventType: string,
  ipAddress: string,
  userAgent: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.securityEvent.create({
    data: {
      userId,
      eventType,
      ipAddress,
      userAgent,
      metadata: metadata ?? undefined,
    },
  });
}

export async function logLoginHistory(
  userId: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  failureReason?: string
): Promise<void> {
  await prisma.loginHistory.create({
    data: {
      userId,
      ipAddress,
      userAgent,
      success,
      failureReason: failureReason ?? undefined,
    },
  });
}
