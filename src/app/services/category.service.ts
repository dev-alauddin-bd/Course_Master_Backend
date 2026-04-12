import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";
import { ICategory } from "../interfaces/category.interface";


/**
 * Fetch all available course categories from PostgreSQL
 * 
 * Results are sorted by creation date (newest first) to ensure 
 * latest categories appear at the top.
 * 
 * @returns Array of categories
 */
const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Create a new course category
 * 
 * Includes validation to prevent duplicate category names, 
 * maintaining a clean and unique taxonomy.
 * 
 * @param payload - Category name
 * @returns The newly created category record
 */
const createCategory = async (payload: ICategory) => {
  if (!payload.name) {
    throw new CustomAppError(400, "Category name is required.");
  }

  // Check if category name is already in use
  const existing = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (existing) {
    throw new CustomAppError(400, `Category with name '${payload.name}' already exists`);
  }

  // Persist new category to database
  return await prisma.category.create({
    data: { name: payload.name },
  });
};

/**
 * Update an existing category's details
 * 
 * @param id - The unique category identifier
 * @param payload - Fields to update (e.g. name)
 * @returns Updated category object
 */
const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  // Ensure the target category exists before attempting update
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new CustomAppError(404, "Target category not found for update operations");
  }

  return await prisma.category.update({
    where: { id },
    data: {
      name: payload.name,
    },
  });
};

/**
 * Permanently remove a category from the system
 * 
 * @param id - The category ID to delete
 * @returns Success message upon removal
 */
const deleteCategory = async (id: string) => {
  // Pre-verification of existence to provide accurate error feedback
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new CustomAppError(404, "The category you're trying to delete does not exist");
  }

  // Deletion logic (Prisma cascade handles related entities if configured)
  await prisma.category.delete({ where: { id } });
  
  return { message: "Category and its associations have been successfully removed" };
};

export const categoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
