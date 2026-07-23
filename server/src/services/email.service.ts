import { IEmailService } from "@/interfaces/email.interface";
import { logger } from "@/utils/logger";

export class EmailService implements IEmailService {
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL ?? "http://localhost:5173"}/verify-email?token=${token}`;

    logger.info(`[EmailService] Sending verification email to ${to}`);
    logger.info(`[EmailService] Verification URL: ${verificationUrl}`);

    // In production, replace with actual email provider (SendGrid, SES, etc.)
    // await this.send({
    //   to,
    //   subject: "Verify your email address",
    //   html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    // });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL ?? "http://localhost:5173"}/reset-password?token=${token}`;

    logger.info(`[EmailService] Sending password reset email to ${to}`);
    logger.info(`[EmailService] Reset URL: ${resetUrl}`);

    // In production, replace with actual email provider
  }
}

export const emailService = new EmailService();
