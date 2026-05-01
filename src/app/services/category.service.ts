//  ====================
//     Category Service
// ====================

import { prisma } from "../../lib/prisma";

export const categoryService = {
  // ============================== GET ALL Categories ==============================
  async getAllCategories() {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { courses: true }
        }
      },
      orderBy: { name: "asc" }
    });
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
