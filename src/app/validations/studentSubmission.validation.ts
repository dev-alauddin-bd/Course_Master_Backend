import { z } from "zod";

export const submitAssignmentValidation = z.object({
  assignmentId: z.string().uuid("Invalid assignment ID"),
  answerText: z
    .string()
    .trim()
    .min(1, "Answer cannot be empty")
    .max(20000, "Answer is too long"),
});
