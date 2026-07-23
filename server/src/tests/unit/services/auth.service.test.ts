jest.mock("@/config", () => ({
  config: {
    JWT_SECRET: "test-access-secret-key-for-testing-32ch",
    JWT_REFRESH_SECRET: "test-refresh-secret-key-for-testing-32ch",
    JWT_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_IN: "7d",
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MS: 900000,
  },
}));

jest.mock("@/config/jwt.config", () => ({
  jwtConfig: {
    secret: "test-access-secret-key-for-testing-32ch",
    refreshSecret: "test-refresh-secret-key-for-testing-32ch",
    expiresIn: "15m",
    refreshExpiresIn: "7d",
  },
}));

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    role: { findUnique: jest.fn() },
    user: { update: jest.fn(), findFirst: jest.fn() },
    securityEvent: { create: jest.fn() },
    loginHistory: { create: jest.fn() },
    passwordResetToken: { create: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma), RoleName: { USER: "USER" } };
});

jest.mock("@/config/database.config", () => ({
  __esModule: true,
  default: {
    role: { findUnique: jest.fn() },
    user: { update: jest.fn(), findFirst: jest.fn() },
    securityEvent: { create: jest.fn() },
    loginHistory: { create: jest.fn() },
    passwordResetToken: { create: jest.fn() },
  },
}));

jest.mock("@/repositories/auth.repository", () => ({
  authRepository: {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
    updateRefreshToken: jest.fn(),
    findUserById: jest.fn(),
    createResetToken: jest.fn(),
    findResetToken: jest.fn(),
    markTokenUsed: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

jest.mock("@/services/hash.service", () => ({
  hashService: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

jest.mock("@/services/token.service", () => ({
  tokenService: {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  },
}));

jest.mock("@/security/accountLockout", () => ({
  isAccountLocked: jest.fn(),
  handleFailedLogin: jest.fn(),
  handleSuccessfulLogin: jest.fn(),
}));

jest.mock("@/security/securityEvents", () => ({
  logSecurityEvent: jest.fn(),
  logLoginHistory: jest.fn(),
}));

jest.mock("@/services/email.service", () => ({
  emailService: {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  },
}));

jest.mock("@/services/password", () => ({
  checkPasswordStrength: jest.fn(),
}));

import { AuthService } from "@/services/auth.service";
import { authRepository } from "@/repositories/auth.repository";
import { hashService } from "@/services/hash.service";
import { tokenService } from "@/services/token.service";
import { isAccountLocked, handleFailedLogin, handleSuccessfulLogin } from "@/security/accountLockout";
import { logSecurityEvent, logLoginHistory } from "@/security/securityEvents";
import { emailService } from "@/services/email.service";
import { checkPasswordStrength } from "@/services/password";
import prisma from "@/config/database.config";

const mockAuthRepo = jest.mocked(authRepository);
const mockHashService = jest.mocked(hashService);
const mockTokenService = jest.mocked(tokenService);
const mockIsAccountLocked = jest.mocked(isAccountLocked);
const mockHandleFailedLogin = jest.mocked(handleFailedLogin);
const mockHandleSuccessfulLogin = jest.mocked(handleSuccessfulLogin);
const mockLogSecurityEvent = jest.mocked(logSecurityEvent);
const mockLogLoginHistory = jest.mocked(logLoginHistory);
const mockEmailService = jest.mocked(emailService);
const mockCheckPasswordStrength = jest.mocked(checkPasswordStrength);
const mockPrisma = jest.mocked(prisma);

const metadata = { ipAddress: "127.0.0.1", userAgent: "test-agent" };

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  username: "testuser",
  passwordHash: "$2b$12$hashed",
  firstName: "Test",
  lastName: "User",
  role: { name: "USER" },
  isEmailVerified: false,
  refreshToken: null as string | null,
  refreshTokenExpAt: null as Date | null,
  failedAttempts: 0,
  isLocked: false,
  lockUntil: null as Date | null,
};

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe("register", () => {
    const registerInput = {
      email: "new@example.com",
      username: "newuser",
      password: "Str0ng!Pass#2024",
      firstName: "New",
      lastName: "User",
    };

    beforeEach(() => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);
      mockAuthRepo.findByUsername.mockResolvedValue(null);
      mockCheckPasswordStrength.mockReturnValue({
        score: 80,
        strength: "Strong",
        feedback: [],
      } as any);
      mockHashService.hash.mockResolvedValue("$2b$12$hashed");
      (mockPrisma.role.findUnique as jest.Mock).mockResolvedValue({ id: "role-1", name: "USER" });
      mockAuthRepo.create.mockResolvedValue({
        ...mockUser,
        id: "new-user-123",
        email: "new@example.com",
        username: "newuser",
      });
      mockTokenService.signAccessToken.mockReturnValue("access-token");
      mockTokenService.signRefreshToken.mockReturnValue("refresh-token");
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({});
      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);
    });

    it("should create user and return tokens", async () => {
      const result = await authService.register(registerInput, metadata);

      expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith("new@example.com");
      expect(mockAuthRepo.findByUsername).toHaveBeenCalledWith("newuser");
      expect(mockHashService.hash).toHaveBeenCalledWith("Str0ng!Pass#2024");
      expect(mockTokenService.signAccessToken).toHaveBeenCalled();
      expect(mockTokenService.signRefreshToken).toHaveBeenCalled();
      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
      expect(result.user.email).toBe("new@example.com");
    });

    it("should throw ConflictError for duplicate email", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(mockUser as any);

      await expect(authService.register(registerInput, metadata)).rejects.toThrow("Email is already registered");
    });

    it("should throw ConflictError for duplicate username", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);
      mockAuthRepo.findByUsername.mockResolvedValue({ id: "other" } as any);

      await expect(authService.register(registerInput, metadata)).rejects.toThrow("Username is already taken");
    });

    it("should throw BadRequestError for weak password", async () => {
      mockCheckPasswordStrength.mockReturnValue({
        score: 10,
        strength: "Weak",
        feedback: [],
      } as any);

      await expect(authService.register(registerInput, metadata)).rejects.toThrow("Password is too weak");
    });

    it("should throw BadRequestError for Very Weak password", async () => {
      mockCheckPasswordStrength.mockReturnValue({
        score: 5,
        strength: "Very Weak",
        feedback: [],
      } as any);

      await expect(authService.register(registerInput, metadata)).rejects.toThrow("Password is too weak");
    });

    it("should send verification email after registration", async () => {
      await authService.register(registerInput, metadata);

      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        "new@example.com",
        expect.any(String),
      );
    });

    it("should log security event on registration", async () => {
      await authService.register(registerInput, metadata);

      expect(mockLogSecurityEvent).toHaveBeenCalledWith(
        "new-user-123",
        "REGISTER",
        "127.0.0.1",
        "test-agent",
      );
    });
  });

  describe("login", () => {
    const loginInput = { email: "test@example.com", password: "Str0ng!Pass#2024" };

    beforeEach(() => {
      mockAuthRepo.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: "$2b$12$hashed",
      } as any);
      mockIsAccountLocked.mockResolvedValue(false);
      mockHashService.compare.mockResolvedValue(true);
      mockTokenService.signAccessToken.mockReturnValue("access-token");
      mockTokenService.signRefreshToken.mockReturnValue("refresh-token");
      mockHashService.hash.mockResolvedValue("$2b$12$refresh-hashed");
    });

    it("should return tokens with valid credentials", async () => {
      const result = await authService.login(loginInput, metadata);

      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
      expect(result.user.email).toBe("test@example.com");
      expect(mockHandleSuccessfulLogin).toHaveBeenCalledWith("user-123");
      expect(mockLogLoginHistory).toHaveBeenCalledWith(
        "user-123",
        "127.0.0.1",
        "test-agent",
        true,
      );
    });

    it("should throw UnauthorizedError for wrong password", async () => {
      mockHashService.compare.mockResolvedValue(false);

      await expect(authService.login(loginInput, metadata)).rejects.toThrow("Invalid credentials");
      expect(mockHandleFailedLogin).toHaveBeenCalledWith("user-123");
      expect(mockLogLoginHistory).toHaveBeenCalledWith(
        "user-123",
        "127.0.0.1",
        "test-agent",
        false,
        "Invalid password",
      );
    });

    it("should throw UnauthorizedError for non-existent email", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginInput, metadata)).rejects.toThrow("Invalid credentials");
    });

    it("should throw LockedError for locked account", async () => {
      mockIsAccountLocked.mockResolvedValue(true);

      await expect(authService.login(loginInput, metadata)).rejects.toThrow("Account is locked");
    });

    it("should use rememberMe for refresh token expiry", async () => {
      const result = await authService.login({ ...loginInput, rememberMe: true }, metadata);

      expect(mockTokenService.signRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({ sub: "user-123" }),
        true,
      );
      expect(result.refreshToken).toBe("refresh-token");
    });
  });

  describe("logout", () => {
    it("should clear refresh token and log event", async () => {
      await authService.logout("user-123", metadata);

      expect(mockAuthRepo.updateRefreshToken).toHaveBeenCalledWith("user-123", null, null);
      expect(mockLogSecurityEvent).toHaveBeenCalledWith("user-123", "LOGOUT", "127.0.0.1", "test-agent");
    });
  });

  describe("refreshToken", () => {
    const validRefreshToken = "valid-refresh-token";

    beforeEach(() => {
      mockTokenService.verifyRefreshToken.mockReturnValue({
        sub: "user-123",
        email: "test@example.com",
        role: "USER",
      } as any);
      mockAuthRepo.findUserById.mockResolvedValue({
        ...mockUser,
        refreshToken: "$2b$12$hashed-refresh",
        refreshTokenExpAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      } as any);
      mockHashService.compare.mockResolvedValue(true);
      mockTokenService.signAccessToken.mockReturnValue("new-access-token");
      mockTokenService.signRefreshToken.mockReturnValue("new-refresh-token");
      mockHashService.hash.mockResolvedValue("$2b$12$new-refresh-hashed");
    });

    it("should return new tokens with valid refresh token", async () => {
      const result = await authService.refreshToken(validRefreshToken);

      expect(result.accessToken).toBe("new-access-token");
      expect(result.refreshToken).toBe("new-refresh-token");
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith(validRefreshToken);
      expect(mockAuthRepo.updateRefreshToken).toHaveBeenCalled();
    });

    it("should throw UnauthorizedError for invalid token", async () => {
      mockTokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      await expect(authService.refreshToken("bad-token")).rejects.toThrow("Invalid or expired refresh token");
    });

    it("should throw UnauthorizedError when user not found", async () => {
      mockAuthRepo.findUserById.mockResolvedValue(null);

      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow("Invalid refresh token");
    });

    it("should throw UnauthorizedError when user has no refresh token", async () => {
      mockAuthRepo.findUserById.mockResolvedValue({
        ...mockUser,
        refreshToken: null,
      } as any);

      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow("Invalid refresh token");
    });

    it("should throw UnauthorizedError when refresh token is expired", async () => {
      mockAuthRepo.findUserById.mockResolvedValue({
        ...mockUser,
        refreshToken: "$2b$12$hashed-refresh",
        refreshTokenExpAt: new Date(Date.now() - 1000),
      } as any);

      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow("Refresh token has expired");
    });

    it("should throw UnauthorizedError when token hash doesn't match", async () => {
      mockHashService.compare.mockResolvedValue(false);

      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow("Invalid refresh token");
      expect(mockAuthRepo.updateRefreshToken).toHaveBeenCalledWith("user-123", null, null);
    });
  });

  describe("forgotPassword", () => {
    it("should create reset token for existing user", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(mockUser as any);
      mockAuthRepo.createResetToken.mockResolvedValue({} as any);

      await authService.forgotPassword({ email: "test@example.com" });

      expect(mockAuthRepo.createResetToken).toHaveBeenCalledWith(
        "user-123",
        expect.any(String),
        expect.any(Date),
      );
    });

    it("should return silently for non-existent email (no user enumeration)", async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.forgotPassword({ email: "nonexistent@example.com" }),
      ).resolves.toBeUndefined();
      expect(mockAuthRepo.createResetToken).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    const resetTokenRecord = {
      token: "valid-reset-token",
      userId: "user-123",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      used: false,
    };

    beforeEach(() => {
      mockAuthRepo.findResetToken.mockResolvedValue(resetTokenRecord as any);
      mockCheckPasswordStrength.mockReturnValue({
        score: 80,
        strength: "Strong",
        feedback: [],
      } as any);
      mockHashService.hash.mockResolvedValue("$2b$12$new-hash");
    });

    it("should reset password with valid token", async () => {
      await authService.resetPassword({ token: "valid-reset-token", newPassword: "N3wStr0ng!Pass#1" });

      expect(mockAuthRepo.findResetToken).toHaveBeenCalledWith("valid-reset-token");
      expect(mockAuthRepo.updatePassword).toHaveBeenCalledWith("user-123", "$2b$12$new-hash");
      expect(mockAuthRepo.markTokenUsed).toHaveBeenCalledWith("valid-reset-token");
      expect(mockAuthRepo.updateRefreshToken).toHaveBeenCalledWith("user-123", null, null);
      expect(mockLogSecurityEvent).toHaveBeenCalledWith(
        "user-123",
        "PASSWORD_RESET",
        "system",
        "password-reset-flow",
      );
    });

    it("should throw BadRequestError for invalid token", async () => {
      mockAuthRepo.findResetToken.mockResolvedValue(null);

      await expect(
        authService.resetPassword({ token: "invalid", newPassword: "N3wStr0ng!Pass#1" }),
      ).rejects.toThrow("Invalid or expired reset token");
    });

    it("should throw BadRequestError for already used token", async () => {
      mockAuthRepo.findResetToken.mockResolvedValue({
        ...resetTokenRecord,
        used: true,
      } as any);

      await expect(
        authService.resetPassword({ token: "valid-reset-token", newPassword: "N3wStr0ng!Pass#1" }),
      ).rejects.toThrow("This reset token has already been used");
    });

    it("should throw BadRequestError for expired token", async () => {
      mockAuthRepo.findResetToken.mockResolvedValue({
        ...resetTokenRecord,
        expiresAt: new Date(Date.now() - 1000),
      } as any);

      await expect(
        authService.resetPassword({ token: "valid-reset-token", newPassword: "N3wStr0ng!Pass#1" }),
      ).rejects.toThrow("Invalid or expired reset token");
    });

    it("should throw BadRequestError for weak password", async () => {
      mockCheckPasswordStrength.mockReturnValue({
        score: 10,
        strength: "Weak",
        feedback: [],
      } as any);

      await expect(
        authService.resetPassword({ token: "valid-reset-token", newPassword: "weakpass" }),
      ).rejects.toThrow("Password is too weak");
    });
  });

  describe("verifyEmail", () => {
    it("should verify email with valid token", async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: "user-123",
        emailVerificationToken: "valid-token",
        emailVerificationExpires: new Date(Date.now() + 3600000),
      });
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({});

      await authService.verifyEmail({ token: "valid-token" });

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          emailVerificationToken: "valid-token",
          emailVerificationExpires: { gt: expect.any(Date) },
        },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });
      expect(mockLogSecurityEvent).toHaveBeenCalledWith(
        "user-123",
        "EMAIL_VERIFIED",
        "system",
        "email-verification-flow",
      );
    });

    it("should throw BadRequestError for invalid token", async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(authService.verifyEmail({ token: "invalid" })).rejects.toThrow(
        "Invalid or expired verification token",
      );
    });
  });

  describe("changePassword", () => {
    const changeInput = { currentPassword: "OldPass!123", newPassword: "N3wStr0ng!Pass#1" };

    beforeEach(() => {
      mockAuthRepo.findUserById.mockResolvedValue({
        ...mockUser,
        passwordHash: "$2b$12$old-hash",
      } as any);
      mockHashService.compare.mockResolvedValue(true);
      mockCheckPasswordStrength.mockReturnValue({
        score: 80,
        strength: "Strong",
        feedback: [],
      } as any);
      mockHashService.hash.mockResolvedValue("$2b$12$new-hash");
    });

    it("should change password with valid current password", async () => {
      await authService.changePassword("user-123", changeInput, metadata);

      expect(mockAuthRepo.updatePassword).toHaveBeenCalledWith("user-123", "$2b$12$new-hash");
      expect(mockAuthRepo.updateRefreshToken).toHaveBeenCalledWith("user-123", null, null);
      expect(mockLogSecurityEvent).toHaveBeenCalledWith("user-123", "PASSWORD_CHANGED", "127.0.0.1", "test-agent");
    });

    it("should throw UnauthorizedError when user not found", async () => {
      mockAuthRepo.findUserById.mockResolvedValue(null);

      await expect(
        authService.changePassword("user-123", changeInput, metadata),
      ).rejects.toThrow("User not found");
    });

    it("should throw UnauthorizedError for wrong current password", async () => {
      mockHashService.compare.mockResolvedValue(false);

      await expect(
        authService.changePassword("user-123", changeInput, metadata),
      ).rejects.toThrow("Current password is incorrect");
    });

    it("should throw BadRequestError when new password equals current", async () => {
      await expect(
        authService.changePassword("user-123", { currentPassword: "Same!Pass1", newPassword: "Same!Pass1" }, metadata),
      ).rejects.toThrow("New password must be different from current password");
    });

    it("should throw BadRequestError for weak new password", async () => {
      mockCheckPasswordStrength.mockReturnValue({
        score: 10,
        strength: "Weak",
        feedback: [],
      } as any);

      await expect(
        authService.changePassword("user-123", { currentPassword: "Old!Pass1", newPassword: "weakpass" }, metadata),
      ).rejects.toThrow("New password is too weak");
    });
  });
});
