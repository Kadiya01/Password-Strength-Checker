import crypto from "crypto";
import { JwtPayload } from "jsonwebtoken";
import { RegisterInput, LoginInput, AuthResponse, RequestMetadata, ForgotPasswordInput, ResetPasswordInput } from "@/interfaces";
import { authRepository } from "@/repositories/auth.repository";
import { hashService } from "./hash.service";
import { tokenService } from "./token.service";
import { isAccountLocked, handleFailedLogin, handleSuccessfulLogin } from "@/security/accountLockout";
import { logSecurityEvent, logLoginHistory } from "@/security/securityEvents";
import { BadRequestError, UnauthorizedError, ConflictError, LockedError } from "@/utils/ApiError";
import { RoleName } from "@prisma/client";
import prisma from "@/config/database.config";

export class AuthService {
  async register(input: RegisterInput, metadata: RequestMetadata): Promise<AuthResponse> {
    const existingEmail = await authRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError("Email is already registered");
    }

    const existingUsername = await authRepository.findByUsername(input.username);
    if (existingUsername) {
      throw new ConflictError("Username is already taken");
    }

    const passwordHash = await hashService.hash(input.password);

    const role = await prisma.role.findUnique({ where: { name: RoleName.USER } });
    if (!role) {
      throw new BadRequestError("System configuration error");
    }

    const user = await authRepository.create({
      ...input,
      passwordHash,
      roleId: role.id,
    });

    const accessToken = tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    const refreshToken = tokenService.signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const hashedRefreshToken = await hashService.hash(refreshToken);
    await authRepository.updateRefreshToken(user.id, hashedRefreshToken, refreshExpiry);

    await logSecurityEvent(user.id, "REGISTER", metadata.ipAddress, metadata.userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput, metadata: RequestMetadata): Promise<AuthResponse> {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (await isAccountLocked(user.id)) {
      throw new LockedError("Account is locked due to too many failed attempts. Please try again later.");
    }

    const isPasswordValid = await hashService.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      await handleFailedLogin(user.id);
      await logLoginHistory(user.id, metadata.ipAddress, metadata.userAgent, false, "Invalid password");
      await logSecurityEvent(user.id, "LOGIN_FAILURE", metadata.ipAddress, metadata.userAgent, {
        reason: "Invalid password",
      });
      throw new UnauthorizedError("Invalid credentials");
    }

    await handleSuccessfulLogin(user.id);
    await logLoginHistory(user.id, metadata.ipAddress, metadata.userAgent, true);
    await logSecurityEvent(user.id, "LOGIN_SUCCESS", metadata.ipAddress, metadata.userAgent);

    const accessToken = tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    const rememberMe = input.rememberMe ?? false;
    const refreshToken = tokenService.signRefreshToken(
      {
        sub: user.id,
        email: user.email,
        role: user.role.name,
      },
      rememberMe,
    );

    const refreshExpiryMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const refreshExpiry = new Date(Date.now() + refreshExpiryMs);
    const hashedRefreshToken = await hashService.hash(refreshToken);
    await authRepository.updateRefreshToken(user.id, hashedRefreshToken, refreshExpiry);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string, metadata: RequestMetadata): Promise<void> {
    await authRepository.updateRefreshToken(userId, null, null);
    await logSecurityEvent(userId, "LOGOUT", metadata.ipAddress, metadata.userAgent);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let decoded: JwtPayload;
    try {
      decoded = tokenService.verify(refreshToken) as JwtPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const userId = decoded.sub as string;
    const user = await authRepository.findUserByRefreshToken(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (user.refreshTokenExpAt && user.refreshTokenExpAt <= new Date()) {
      await authRepository.updateRefreshToken(userId, null, null);
      throw new UnauthorizedError("Refresh token has expired");
    }

    const newAccessToken = tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    const newRefreshToken = tokenService.signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    const hashedRefreshToken = await hashService.hash(newRefreshToken);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authRepository.updateRefreshToken(user.id, hashedRefreshToken, refreshExpiry);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await authRepository.findByEmail(input.email);

    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await authRepository.createResetToken(user.id, resetToken, expiresAt);

    // TODO: Send reset email with token in production
    // await emailService.sendPasswordReset(user.email, resetToken);
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const resetTokenRecord = await authRepository.findResetToken(input.token);

    if (!resetTokenRecord) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    if (resetTokenRecord.used) {
      throw new BadRequestError("This reset token has already been used");
    }

    if (resetTokenRecord.expiresAt <= new Date()) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    const passwordHash = await hashService.hash(input.newPassword);
    await authRepository.updatePassword(resetTokenRecord.userId, passwordHash);
    await authRepository.markTokenUsed(input.token);
    await authRepository.updateRefreshToken(resetTokenRecord.userId, null, null);

    await logSecurityEvent(
      resetTokenRecord.userId,
      "PASSWORD_RESET",
      "system",
      "password-reset-flow",
    );
  }
}

export const authService = new AuthService();
