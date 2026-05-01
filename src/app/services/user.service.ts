//  ====================
//      User Service
// ====================

import { prisma } from "../../lib/prisma";

export const userService = {
  // ============================== GET ALL Users ==============================
  async getAllUsers(requester: any, query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const whereCondition = requester.role === 'instructor' 
      ? { enrolledCourses: { some: { course: { instructorId: requester.id } } } }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
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
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereCondition })
    ]);

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      joinDate: user.createdAt,
      courses: user._count.enrolledCourses,
    }));

    return {
      users: formattedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  // ============================== UPDATE User Role ==============================
  async updateUserRole(userId: string, role: any) {
    return await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
  },

  // ============================== UPDATE User Status ==============================
  async updateUserStatus(userId: string, status: any) {
    return await prisma.user.update({
      where: { id: userId },
      data: { status }
    });
  },

  // ============================== BECOME Instructor ==============================
  async becomeInstructor(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { role: 'instructor' }
    });
  },

  // ============================== UPDATE Profile ==============================
  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }
};
