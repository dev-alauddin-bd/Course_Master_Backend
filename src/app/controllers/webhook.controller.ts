import { Request, Response } from "express";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
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
    console.error("❌ Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("🔥 WEBHOOK EVENT:", event.type);

  // =========================
  // CHECKOUT SUCCESS
  // =========================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    console.log("📦 SESSION METADATA:", session.metadata);

    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;

    if (!userId || !courseId) {
      console.log("❌ Missing metadata, skipping...");
      return res.status(200).json({ received: true });
    }

    try {
      await prisma.$transaction(async (tx) => {
        // update payment
        await tx.payment.update({
          where: { stripeSessionId: session.id },
          data: {
            status: "completed",
            stripePaymentId: session.payment_intent,
          },
        });

        // create enrollment (safe upsert)
        await tx.enrollment.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          create: {
            userId,
            courseId,
          },
          update: {},
        });
      });

      console.log("✅ Enrollment SUCCESS");
    } catch (err) {
      console.error("❌ DB ERROR:", err);
    }
  }

  return res.status(200).json({ received: true });
};