import { prisma } from "../../lib/prisma";

export const userService = {
  async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { enrolledCourses: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      joinDate: user.createdAt,
      courses: user._count.enrolledCourses,
    }));
  },

  async updateUserRole(userId: string, role: any) {
    return await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
  },

  async updateUserStatus(userId: string, status: any) {
    return await prisma.user.update({
      where: { id: userId },
      data: { status }
    });
  },

  async becomeInstructor(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { role: 'instructor' }
    });
  },

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }
};
