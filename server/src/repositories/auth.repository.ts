import prisma from "@/config/database.config";
import { RegisterInput } from "@/interfaces";

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, include: { role: true } });
  }

  async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  }

  async create(data: RegisterInput & { passwordHash: string; roleId: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: data.roleId,
      },
      include: { role: true },
    });
  }

  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null, expiresAt: Date | null) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken,
        refreshTokenExpAt: expiresAt,
      },
    });
  }

  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
  }

  async createResetToken(userId: string, token: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async markTokenUsed(token: string) {
    return prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}

export const authRepository = new AuthRepository();
