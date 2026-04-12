import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { CustomAppError } from "../errors/customError";

/**====================================
 * Create a Stripe Checkout Session
 * ===================================
 */
const createCheckoutSession = async (userId: string, courseId: string) => {
  console.log("==================================");
  console.log("🚀 PAYMENT CHECKOUT START");
  console.log("👤 userId:", userId);
  console.log("📚 courseId:", courseId);

  const course = await prisma.course.findUnique({ where: { id: courseId } });

  console.log("📦 COURSE FOUND:", course ? "YES" : "NO");

  if (!course) {
    console.log("❌ Course not found");
    throw new CustomAppError(404, "Course not found");
  }

  if (course.price === 0) {
    console.log("🆓 This is a free course");
    throw new CustomAppError(400, "This course is free. Please use standard enrollment.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    console.log("❌ User not found");
    throw new CustomAppError(404, "User not found");
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existingEnrollment) {
    console.log("⚠️ Already enrolled");
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

  console.log("🎟️ STRIPE SESSION CREATED:", session.id);
  console.log("🔗 PAYMENT URL:", session.url);

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

  console.log("💾 PAYMENT SAVED (pending)");

  return { paymentUrl: session.url };
};

export const paymentService = {
  createCheckoutSession,
};
