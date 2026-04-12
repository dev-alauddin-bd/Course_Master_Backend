import { Request, Response } from "express";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).send("Missing stripe signature");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("🔥 WEBHOOK HIT:", event.type);

  // =========================
  // PAYMENT SUCCESS
  // =========================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const { courseId, userId } = session.metadata || {};

    try {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { stripeSessionId: session.id },
          data: {
            status: "completed",
            stripePaymentId: session.payment_intent as string,
          },
        });

        await tx.enrollment.upsert({
          where: {
            userId_courseId: { userId, courseId },
          },
          create: { userId, courseId },
          update: {},
        });
      });

      console.log("💰 Payment completed + enrollment done");
    } catch (err) {
      console.error("❌ DB transaction failed:", err);
      return res.status(500).send("DB error");
    }
  }

  // =========================
  // SESSION EXPIRED
  // =========================
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as any;

    try {
      await prisma.payment.updateMany({
        where: {
          stripeSessionId: session.id,
          status: "pending",
        },
        data: {
          status: "failed",
        },
      });

      console.log("⚠️ Payment marked failed");
    } catch (err) {
      console.error("❌ Expired session update failed:", err);
    }
  }

  // =========================
  // REFUND
  // =========================
  if (event.type === "charge.refunded") {
    const charge = event.data.object as any;

    try {
      const payment = await prisma.payment.findFirst({
        where: {
          stripePaymentId: charge.payment_intent as string,
        },
      });

      if (payment) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "refunded" },
          });

          await tx.enrollment.delete({
            where: {
              userId_courseId: {
                userId: payment.userId,
                courseId: payment.courseId,
              },
            },
          });
        });

        console.log("💸 Refund processed");
      }
    } catch (err) {
      console.error("❌ Refund failed:", err);
    }
  }

  return res.status(200).json({ received: true });
};