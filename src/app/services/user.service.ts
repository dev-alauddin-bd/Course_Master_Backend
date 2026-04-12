import { prisma } from "../../lib/prisma";

export const userService = {
  async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { enrolledCourses: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10 // Limiting for dashboard view
    });

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      joinDate: user.createdAt,
      courses: user._count.enrolledCourses,
      // Determining simple active status (mock logic: if they have enrolled, active)
      status: user._count.enrolledCourses > 0 ? "active" : "inactive"
    }));
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

