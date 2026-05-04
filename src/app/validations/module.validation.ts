import { z } from "zod";

export const createModuleValidation = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  title: z.string().trim().min(2, "Module title must be at least 2 characters").max(200, "Title is too long"),
  order: z.number().int().min(1, "Order must be at least 1").optional(),
});

export const updateModuleValidation = z.object({
  title: z.string().trim().min(2, "Module title must be at least 2 characters").max(200).optional(),
  order: z.number().int().min(1).optional(),
});
