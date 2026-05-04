import { z } from "zod";

export const createCategoryValidation = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(100, "Name is too long"),
  description: z.string().trim().max(500, "Description is too long").optional(),
  icon: z.string().trim().max(100).optional(),
});

export const updateCategoryValidation = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  icon: z.string().trim().max(100).optional(),
});
