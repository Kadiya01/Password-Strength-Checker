jest.mock("@/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import { EmailService } from "@/services/email.service";
import { logger } from "@/utils/logger";

const mockLogger = jest.mocked(logger);

describe("EmailService", () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
    jest.clearAllMocks();
  });

  describe("sendVerificationEmail", () => {
    it("should log verification email details", async () => {
      await emailService.sendVerificationEmail("test@example.com", "verify-token-123");

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Sending verification email to test@example.com"),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Verification URL:"),
      );
    });

    it("should use CLIENT_URL from env if set", async () => {
      const original = process.env.CLIENT_URL;
      process.env.CLIENT_URL = "https://myapp.com";

      await emailService.sendVerificationEmail("test@example.com", "token-123");

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("https://myapp.com/verify-email?token=token-123"),
      );

      process.env.CLIENT_URL = original;
    });

    it("should default to localhost:5173 if CLIENT_URL not set", async () => {
      const original = process.env.CLIENT_URL;
      delete process.env.CLIENT_URL;

      await emailService.sendVerificationEmail("test@example.com", "token-123");

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("http://localhost:5173/verify-email?token=token-123"),
      );

      process.env.CLIENT_URL = original;
    });

    it("should not throw when called", async () => {
      await expect(
        emailService.sendVerificationEmail("test@example.com", "token"),
      ).resolves.toBeUndefined();
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should log password reset email details", async () => {
      await emailService.sendPasswordResetEmail("test@example.com", "reset-token-123");

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Sending password reset email to test@example.com"),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Reset URL:"),
      );
    });

    it("should use CLIENT_URL from env if set", async () => {
      const original = process.env.CLIENT_URL;
      process.env.CLIENT_URL = "https://myapp.com";

      await emailService.sendPasswordResetEmail("test@example.com", "reset-token");

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("https://myapp.com/reset-password?token=reset-token"),
      );

      process.env.CLIENT_URL = original;
    });

    it("should default to localhost:5173 if CLIENT_URL not set", async () => {
      const original = process.env.CLIENT_URL;
      delete process.env.CLIENT_URL;

      await emailService.sendPasswordResetEmail("test@example.com", "reset-token");

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("http://localhost:5173/reset-password?token=reset-token"),
      );

      process.env.CLIENT_URL = original;
    });

    it("should not throw when called", async () => {
      await expect(
        emailService.sendPasswordResetEmail("test@example.com", "token"),
      ).resolves.toBeUndefined();
    });
  });
});
