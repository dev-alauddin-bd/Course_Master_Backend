//  ====================
//     Enroll Service
// ====================

import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";

export const enrollService = {
  // ============================== ENROLL In Course ==============================
  async enrollCourse(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      throw new CustomAppError(404, "Course not found");
    }

    if (course.price > 0) {
      throw new CustomAppError(400, "This is a paid course. Please proceed to payment checkout.");
    }

    return await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });
  },

  // ============================== GET My Enrollments ==============================
  async getMyEnrollments(userId: string) {
    return await prisma.enrollment.findMany({
      where: { userId },
      include: { course: true }
    });
  },

  // ============================== GET Enrolled Content ==============================
  async getEnrolledCourseContent(userId: string, courseId: string) {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        modules: {
          include: {
            assignments: true,
            lessons: {
              include: {
                completedByUsers: { where: { userId } }
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      throw new CustomAppError(404, "Course not found");
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (!enrollment) {
      throw new CustomAppError(403, "Access denied: You are not enrolled in this course");
    }

    // Linear progression logic
    let isNextLessonLocked = false;
    const processedModules = course.modules.map(mod => {
      const processedLessons = mod.lessons.map(les => {
        const isCompleted = les.completedByUsers.length > 0;
        const isUnlocked = !isNextLessonLocked;
        
        // Lock subsequent lessons if this one is not completed
        if (!isCompleted) {
          isNextLessonLocked = true;
        }

        return {
          id: les.id,
          title: les.title,
          videoUrl: les.videoUrl,
          duration: les.duration,
          order: les.order,
          isCompleted,
          isUnlocked
        };
      });

      const lessonCount = processedLessons.length;
      const completedCount = processedLessons.filter(l => l.isCompleted).length;

      return {
        id: mod.id,
        title: mod.title,
        order: mod.order,
        lessonCount,
        completedCount,
        progressPercentage: lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0,
        assignments: mod.assignments,
        lessons: processedLessons
      };
    });

    return {
      ...course,
      modules: processedModules
    };
  },
};
