import type { UserRecord, UserRepository } from "@/application/auth/ports";
import { prisma } from "./prisma-client";

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        isActive: true,
        failedLoginCount: true,
        lockedUntil: true
      }
    });
  }

  async registerFailedLogin(userId: string, lockUntil: Date | null): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { failedLoginCount: lockUntil ? 0 : { increment: 1 }, lockedUntil: lockUntil }
    });
  }

  async registerSuccessfulLogin(userId: string, at: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: at }
    });
  }
}
