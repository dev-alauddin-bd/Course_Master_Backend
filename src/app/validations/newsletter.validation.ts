import z from "zod";

export const newsletterValidation = z.object({
  email: z.string().email("Invalid email address"),
});
