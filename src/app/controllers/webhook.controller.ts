import { Request, Response } from "express";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import logger from "../../lib/logger";

export const stripeWebhook = async (req: Request, res: Response) => {
  logger.info("🔥 WEBHOOK HIT");

  const sig = req.headers["stripe-signature"];
  logger.debug("🔐 Signature exists:", !!sig);

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

    logger.info("✅ Event constructed successfully");
  } catch (err: any) {
    logger.error("❌ Webhook signature verification failed", { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  logger.info("🎯 EVENT TYPE:", event.type);
  logger.debug("📦 FULL EVENT DATA:", JSON.stringify(event.data.object, null, 2));

  // ================================
  // ONLY CHECKOUT SESSION EVENT
  // ================================
  if (event.type === "checkout.session.completed") {
    logger.info("🚀 Processing checkout.session.completed");

    const session = event.data.object as any;

    logger.info("🧾 SESSION ID:", session.id);
    logger.debug("📨 METADATA:", session.metadata);

    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;

    logger.info("👤 userId:", userId);
    logger.info("📚 courseId:", courseId);

    if (!userId || !courseId) {
      logger.warn("❌ Missing metadata → STOP");
      return res.status(200).json({ received: true });
    }

    try {
      logger.info("💾 Starting DB transaction...");

      await prisma.$transaction(async (tx) => {
        logger.info("✏️ Updating payment...");

        await tx.payment.update({
          where: { stripeSessionId: session.id },
          data: {
            status: "COMPLETED",
            stripePaymentId: session.payment_intent,
          },
        });

        logger.info("✅ Payment updated");

        logger.info("🎓 Creating enrollment...");

        await tx.enrollment.upsert({
          where: {
            userId_courseId: { userId, courseId },
          },
          create: { userId, courseId },
          update: {},
        });

        logger.info("✅ Enrollment done");
      });

      logger.info("🎉 TRANSACTION SUCCESS");
    } catch (err) {
      logger.error("❌ DB ERROR:", err);
    }
  }

  logger.info("🏁 WEBHOOK END");
  return res.status(200).json({ received: true });
};