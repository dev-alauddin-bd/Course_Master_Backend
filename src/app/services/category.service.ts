//  ====================
//     Category Service
// ====================

import { prisma } from "../../lib/prisma";

export const categoryService = {
  async getAllCategories(query: any = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { courses: true }
          }
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.category.count()
    ]);

    return {
      categories,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  // ============================== CREATE Category ==============================
  async createCategory(data: { name: string; description?: string }) {
    return await prisma.category.create({
      data
    });
  },

  // ============================== UPDATE Category ==============================
  async updateCategory(id: string, data: { name?: string; description?: string }) {
    return await prisma.category.update({
      where: { id },
      data
    });
  },

  // ============================== DELETE Category ==============================
  async deleteCategory(id: string) {
    return await prisma.category.delete({
      where: { id }
    });
  }
};
