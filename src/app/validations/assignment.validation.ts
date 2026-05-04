import { z } from "zod";

export const createAssignmentValidation = z.object({
  moduleId: z.string().uuid("Invalid module ID"),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200, "Title is too long"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000).optional(),
  dueDate: z.string().datetime({ message: "Invalid due date format (ISO 8601 required)" }).optional(),
  maxScore: z.number().int().min(1).optional(),
});

export const updateAssignmentValidation = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  dueDate: z.string().datetime({ message: "Invalid due date format (ISO 8601 required)" }).optional(),
  maxScore: z.number().int().min(1).optional(),
});
