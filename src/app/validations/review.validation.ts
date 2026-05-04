import { z } from "zod";

export const createReviewValidation = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z.string().trim().min(3, "Comment must be at least 3 characters").max(1000, "Comment is too long").optional(),
});
