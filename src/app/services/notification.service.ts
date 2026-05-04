//  ====================
//   Notification Service
// ====================

import { emitToRole } from "../../lib/socket";
import logger from "../../lib/logger";
import { prisma } from "../../lib/prisma";

export interface INotification {
  message: string;
  type: "success" | "error" | "info" | "warning";
  data?: Record<string, unknown>;
}

/**
 * Emit notification to admin and instructor roles
 * Used for: new enrollments, payments, course creation, etc.
 */
export const notifyAdminAndInstructor = async (
  notification: INotification,
  instructorId?: string
) => {
  try {
    emitToRole("admin", "new_notification", notification);
    if (instructorId) {
      emitToRole("instructor", "new_notification", notification);
    }
  } catch (err) {
    logger.error("[NotificationService] Failed to emit notification:", err);
  }
};

/**
 * Emit notification to a specific role
 */
export const notifyRole = async (
  role: "student" | "instructor" | "admin",
  notification: INotification
) => {
  try {
    emitToRole(role, "new_notification", notification);
  } catch (err) {
    logger.error(`[NotificationService] Failed to emit to role ${role}:`, err);
  }
};

/**
 * Emit notification to specific user via admin role (will be filtered on client-side by user ID)
 */
export const notifyUser = async (
  userId: string,
  notification: INotification & { userId?: string }
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      logger.warn(`[NotificationService] User not found: ${userId}`);
      return;
    }

    // Emit to the user's role with their ID for client-side filtering
    emitToRole(user.role, "new_notification", {
      ...notification,
      userId
    });
  } catch (err) {
    logger.error("[NotificationService] Failed to notify user:", err);
  }
};

/**
 * Emit notification to instructor of a specific course
 */
export const notifyInstructorOfCourse = async (
  courseId: string,
  notification: INotification
) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    });

    if (!course) {
      logger.warn(`[NotificationService] Course not found: ${courseId}`);
      return;
    }

    // Emit to instructor role
    emitToRole("instructor", "new_notification", notification);
  } catch (err) {
    logger.error("[NotificationService] Failed to notify instructor:", err);
  }
};

/**
 * Emit notification to all students enrolled in a course
 */
export const notifyStudentsOfCourse = async (
  courseId: string,
  notification: INotification
) => {
  try {
    emitToRole("student", "new_notification", notification);
  } catch (err) {
    logger.error("[NotificationService] Failed to notify students:", err);
  }
};

/**
 * Emit notification to admin only
 */
export const notifyAdmin = async (notification: INotification) => {
  try {
    emitToRole("admin", "new_notification", notification);
  } catch (err) {
    logger.error("[NotificationService] Failed to notify admin:", err);
  }
};

export const notificationService = {
  notifyAdminAndInstructor,
  notifyRole,
  notifyUser,
  notifyInstructorOfCourse,
  notifyStudentsOfCourse,
  notifyAdmin,
};
