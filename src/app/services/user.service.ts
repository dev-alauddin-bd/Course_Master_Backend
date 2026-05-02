//  ====================
//      User Service
// ====================

import { prisma } from "../../lib/prisma";
import { IUser } from "../interfaces/user.interface";
import { CustomAppError } from "../errors/customError";
import { Role, UserStatus } from "@prisma/client";

// ============================== GET ALL Users ==============================
const getAllUsers = async (requester: IUser, query: Record<string, unknown>) => {
  const page = Number(query.page as string) || 1;
  const limit = Number(query.limit as string) || 10;
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
};

// ============================== UPDATE User Role ==============================
const updateUserRole = async (userId: string, role: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new CustomAppError(404, "User not found for role update");

  return await prisma.user.update({
    where: { id: userId },
    data: { role: role as Role }
  });
};

// ============================== UPDATE User Status ==============================
const updateUserStatus = async (userId: string, status: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new CustomAppError(404, "User not found for status update");

  return await prisma.user.update({
    where: { id: userId },
    data: { status: status as UserStatus }
  });
};

// ============================== BECOME Instructor ==============================
const becomeInstructor = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new CustomAppError(404, "User not found");

  return await prisma.user.update({
    where: { id: userId },
    data: { role: 'instructor' }
  });
};

// ============================== UPDATE Profile ==============================
const updateProfile = async (userId: string, data: { name?: string; avatar?: string }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new CustomAppError(404, "User not found for profile update");

  return await prisma.user.update({
    where: { id: userId },
    data,
  });
};

export const userService = {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  becomeInstructor,
  updateProfile
};
