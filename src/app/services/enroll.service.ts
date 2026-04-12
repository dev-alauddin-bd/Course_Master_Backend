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
    console.log("💰 Paid course detected");

    const user = await prisma.user.findUnique({ where: { id: userId } });

    console.log("👤 USER:", user?.email);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      success_url: `${process.env.FRONTEND_URL}/dashboard/student/my-courses?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${course.id}?canceled=true`,

      customer_email: user?.email,
      client_reference_id: userId,

      metadata: {
        userId,
        courseId,
      },

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
            },
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1,
        },
      ],
    });

    console.log("🎟️ STRIPE SESSION CREATED:", session.id);
    console.log("🔗 PAYMENT URL:", session.url);

    await prisma.payment.create({
      data: {
        amount: course.price,
        currency: "usd",
        status: "pending",
        stripeSessionId: session.id,
        userId,
        courseId,
      },
    });

    console.log("💾 PAYMENT SAVED (pending)");

    return { paymentUrl: session.url };
  }

  console.log("🆓 Free course → direct enrollment");

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
          assignment: true,
          quiz: {
            include: { questions: true }
          },
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
      assignment: mod.assignment,
      quiz: mod.quiz,
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

