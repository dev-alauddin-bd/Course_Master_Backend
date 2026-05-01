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
  } catch (err: any) {
    logger.error("❌ Webhook signature verification failed", { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific event types
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;

    if (!userId || !courseId) {
      logger.warn("❌ Missing metadata in checkout session");
      return res.status(200).json({ received: true });
    }

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Update Payment Status
        await tx.payment.update({
          where: { stripeSessionId: session.id },
          data: {
            status: "COMPLETED",
            stripePaymentId: session.payment_intent,
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
  }

  return res.status(200).json({ received: true });
};