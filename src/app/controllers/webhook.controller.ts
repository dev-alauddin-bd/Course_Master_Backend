//  ====================
//   Webhook Controller
// ====================

import { Request, Response } from "express";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import logger from "../../lib/logger";


// ============================== STRIPE Webhook ==============================
export const stripeWebhook = async (req: Request, res: Response) => {
  logger.info("🔥 Stripe Webhook Received");

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    logger.warn("❌ Missing Stripe signature");
    return res.status(400).send("Missing signature");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logger.error("❌ Webhook signature verification failed", { error: errorMessage });
    return res.status(400).send(`Webhook Error: ${errorMessage}`);
  }

  // Handle specific event types
  if (event.type === "checkout.session.completed") {
    interface StripeSession {
      id: string;
      payment_intent: string | null;
      metadata: Record<string, string | undefined> | null;
    }
    const session = event.data.object as unknown as StripeSession;
    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;

    if (!userId || !courseId) {
      logger.warn("❌ Missing metadata in checkout session");
      return res.status(200).json({ received: true });
    }

    try {
       await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true, instructorId: true }
      });

      await prisma.$transaction(async (tx) => {
        // 1. Update Payment Status
        await tx.payment.update({
          where: { stripeSessionId: session.id },
          data: {
            status: "COMPLETED",
            stripePaymentId: session.payment_intent as string,
          },
        });

        // 2. Create Enrollment
        await tx.enrollment.upsert({
          where: { userId_courseId: { userId, courseId } },
          create: { userId, courseId },
          update: {},
        });
      });
      logger.info("✅ Payment and Enrollment processed successfully");
      
    
    } catch (err) {
      logger.error("❌ Webhook Database Transaction Error:", err);
    }
  } else if (
    event.type === "checkout.session.expired" ||
    event.type === "checkout.session.async_payment_failed"
  ) {
    interface StripeSession {
      id: string;
      payment_intent: string | null;
      metadata: Record<string, string | undefined> | null;
    }
    const session = event.data.object as StripeSession;

    try {
      await prisma.payment.update({
        where: { stripeSessionId: session.id },
        data: {
          status: "FAILED",
        },
      });
      logger.info("❌ Payment failed or expired, updated status to FAILED");

     
    } catch (err) {
      logger.error("❌ Failed to update payment status for failed session:", err);
    }
  }

  return res.status(200).json({ received: true });
};