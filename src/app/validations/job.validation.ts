import { z } from "zod";

export const createJobValidation = z.object({
  title: z.string().trim().min(3, "Job title must be at least 3 characters").max(200, "Title is too long"),
  company: z.string().trim().min(2, "Company name is required").max(100),
  location: z.string().trim().min(2, "Location is required").max(200),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(10000),
  salary: z.string().trim().max(100).optional(),
  type: z.enum(["full-time", "part-time", "contract", "internship", "remote"]).optional(),
  deadline: z.string().datetime({ message: "Invalid deadline format (ISO 8601 required)" }).optional(),
});

export const updateJobValidation = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  company: z.string().trim().min(2).max(100).optional(),
  location: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().min(20).max(10000).optional(),
  salary: z.string().trim().max(100).optional(),
  type: z.enum(["full-time", "part-time", "contract", "internship", "remote"]).optional(),
  deadline: z.string().datetime({ message: "Invalid deadline format" }).optional(),
});

export const jobApplicationValidation = z.object({
  jobId: z.string().uuid("Invalid job ID"),
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s\-().]{7,20}$/, "Invalid phone number")
    .optional(),
  coverLetter: z.string().trim().min(20, "Cover letter must be at least 20 characters").max(5000).optional(),
  resumeUrl: z.string().url("Resume URL must be a valid URL").optional(),
});
