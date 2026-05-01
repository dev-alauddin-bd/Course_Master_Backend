//  ====================
//     Payment Service
// ====================

import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { CustomAppError } from "../errors/customError";
import logger from "../../lib/logger";

export const paymentService = {
  // ============================== CREATE Checkout Session ==============================
  async createCheckoutSession(userId: string, courseId: string) {
    logger.info("🚀 Starting payment checkout session...", { userId, courseId });

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new CustomAppError(404, "Course not found");
    }

    if (course.price === 0) {
      throw new CustomAppError(400, "This course is free. Please use standard enrollment.");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new CustomAppError(404, "User not found");
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existingEnrollment) {
      throw new CustomAppError(400, "Already enrolled in this course");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/dashboard/student/my-courses?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${course.id}?canceled=true`,
      customer_email: user.email,
      client_reference_id: userId,
      metadata: { userId, courseId },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: course.title },
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1,
        },
      ],
    });

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

    return { paymentUrl: session.url };
  },
};
