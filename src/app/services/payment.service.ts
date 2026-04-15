import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { CustomAppError } from "../errors/customError";
import logger from "../../lib/logger";

/**====================================
 * Create a Stripe Checkout Session
 * ===================================
 */
const createCheckoutSession = async (userId: string, courseId: string) => {
  logger.info("🚀 PAYMENT CHECKOUT START", { userId, courseId });

  const course = await prisma.course.findUnique({ where: { id: courseId } });

  logger.debug("📦 COURSE FOUND:", course ? "YES" : "NO");

  if (!course) {
    logger.error("❌ Course not found", { courseId });
    throw new CustomAppError(404, "Course not found");
  }

  if (course.price === 0) {
    logger.warn("🆓 This is a free course", { courseId });
    throw new CustomAppError(400, "This course is free. Please use standard enrollment.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    logger.error("❌ User not found", { userId });
    throw new CustomAppError(404, "User not found");
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existingEnrollment) {
    logger.warn("⚠️ Already enrolled", { userId, courseId });
    throw new CustomAppError(400, "Already enrolled in this course");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    success_url: `${process.env.FRONTEND_URL}/dashboard/student/my-courses?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/courses/${course.id}?canceled=true`,

    customer_email: user.email,
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

  logger.info("🎟️ STRIPE SESSION CREATED:", session.id);
  logger.debug("🔗 PAYMENT URL:", session.url);

  await prisma.payment.create({
    data: {
      amount: course.price,
      currency: "usd",
      status: "PENDING",
      stripeSessionId: session.id,
      userId,
      courseId,
    },
  });

  logger.info("💾 PAYMENT SAVED (pending)");

  return { paymentUrl: session.url };
};

export const paymentService = {
  createCheckoutSession,
};

