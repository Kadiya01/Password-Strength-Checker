import prisma from "@/config/database.config";

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id }, include: { role: true } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  }

  async updateProfile(id: string, data: { firstName?: string; lastName?: string; email?: string; username?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}

export const userRepository = new UserRepository();
