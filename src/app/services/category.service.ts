//  ====================
//     Category Service
// ====================

import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";

// ============================== GET ALL Categories ==============================
const getAllCategories = async (query: Record<string, unknown> = {}) => {
  const page = Number(query.page as string) || 1;
  const limit = Number(query.limit as string) || 10;
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
};

// ============================== CREATE Category ==============================
const createCategory = async (data: { name: string; description?: string }) => {
  return await prisma.category.create({
    data
  });
};

// ============================== UPDATE Category ==============================
const updateCategory = async (id: string, data: { name?: string; description?: string }) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new CustomAppError(404, "Category not found for update");

  return await prisma.category.update({
    where: { id },
    data
  });
};

// ============================== DELETE Category ==============================
const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new CustomAppError(404, "Category not found for deletion");

  return await prisma.category.delete({
    where: { id }
  });
};

export const categoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
