import { Prisma } from "@prisma/client";
import prisma from "@/config/database.config";
import { logger } from "@/utils/logger";

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
        metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
      },
    });
  } catch (err) {
    // Never crash the request flow for security logging failures
    logger.error(`Failed to log security event: ${eventType}`, err);
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
    logger.error("Failed to log login history", err);
  }
}
