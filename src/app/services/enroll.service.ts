import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";
import { stripe } from "../../lib/stripe";


/**====================================
 * Enroll a user into a course
 * ===================================
 */
const enrollCourse = async (userId: string, courseId: string) => {
  console.log("==================================");
  console.log("🚀 ENROLL COURSE START");
  console.log("👤 userId:", userId);
  console.log("📚 courseId:", courseId);

  const course = await prisma.course.findUnique({ where: { id: courseId } });

  console.log("📦 COURSE FOUND:", course ? "YES" : "NO");

  if (!course) {
    console.log("❌ Course not found");
    throw new Error("Course not found");
  }

  if (course.price > 0) {
    throw new CustomAppError(400, "This is a paid course. Please proceed to payment checkout.");
  }

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  });

  console.log("🎓 ENROLLED:", enrollment);

  return enrollment;
};

/**====================================
 * Get Enrollments for a user
 * ===================================
 */
const getMyEnrollments = async (userId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { course: true }
  });
  console.log("🎓 MY ENROLLMENTS:", enrollments);
  return enrollments;
};


/**====================================
 * Get detailed curriculum for an enrolled course
 * ===================================
 */
const getEnrolledCourseContent = async (userId: string, courseId: string) => {
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
              completedByUsers: {
                where: { userId }
              }
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
};


export const enrollService = {
  enrollCourse,
  getMyEnrollments,
  getEnrolledCourseContent,
};

