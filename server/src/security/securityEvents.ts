import prisma from "@/config/database.config";

export async function logSecurityEvent(
  userId: string,
  eventType: string,
  ipAddress: string,
  userAgent: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.securityEvent.create({
      data: {
        userId,
        eventType,
        ipAddress,
        userAgent,
        metadata: metadata ?? undefined,
      },
    });
  } catch (err) {
    // Never crash the request flow for security logging failures
    console.error("Failed to log security event:", err);
  }
}

export async function logLoginHistory(
  userId: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  failureReason?: string
): Promise<void> {
  try {
    await prisma.loginHistory.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        success,
        failureReason: failureReason ?? undefined,
      },
    });
  } catch (err) {
    console.error("Failed to log login history:", err);
  }
}
