import { z } from "zod";

export const createLiveSessionValidation = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200, "Title is too long"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000).optional(),
  courseId: z.string().uuid("Invalid course ID").optional(),
  scheduledAt: z.string().datetime({ message: "Invalid scheduled date format (ISO 8601 required)" }),
  duration: z.number().int().min(5, "Duration must be at least 5 minutes").optional(),
  meetingUrl: z.string().url("Meeting URL must be a valid URL").optional(),
  maxAttendees: z.number().int().min(1).optional(),
});

export const updateLiveSessionValidation = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  scheduledAt: z.string().datetime({ message: "Invalid scheduled date format" }).optional(),
  duration: z.number().int().min(5).optional(),
  meetingUrl: z.string().url("Meeting URL must be a valid URL").optional(),
  maxAttendees: z.number().int().min(1).optional(),
});

export const registerSessionValidation = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
});
