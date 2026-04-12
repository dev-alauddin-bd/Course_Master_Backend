import { Request, Response } from "express";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";

export const stripeWebhook = async (req: Request, res: Response) => {
  console.log("==================================");
  console.log("🔥 WEBHOOK HIT");

  const sig = req.headers["stripe-signature"];
  console.log("🔐 Signature exists:", !!sig);

  if (!sig) {
    console.log("❌ Missing Stripe signature");
    return res.status(400).send("Missing signature");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    console.log("✅ Event constructed successfully");
  } catch (err: any) {
    console.log("❌ Webhook signature verification failed");
    console.error(err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("🎯 EVENT TYPE:", event.type);
  console.log("📦 FULL EVENT DATA:", JSON.stringify(event.data.object, null, 2));

  // ================================
  // ONLY CHECKOUT SESSION EVENT
  // ================================
  if (event.type === "checkout.session.completed") {
    console.log("🚀 Processing checkout.session.completed");

    const session = event.data.object as any;

    console.log("🧾 SESSION ID:", session.id);
    console.log("📨 METADATA:", session.metadata);

    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;

    console.log("👤 userId:", userId);
    console.log("📚 courseId:", courseId);

    if (!userId || !courseId) {
      console.log("❌ Missing metadata → STOP");
      return res.status(200).json({ received: true });
    }

    try {
      console.log("💾 Starting DB transaction...");

      await prisma.$transaction(async (tx) => {
        console.log("✏️ Updating payment...");

        await tx.payment.update({
          where: { stripeSessionId: session.id },
          data: {
            status: "COMPLETED",
            stripePaymentId: session.payment_intent,
          },
        });

        console.log("✅ Payment updated");

        console.log("🎓 Creating enrollment...");

        await tx.enrollment.upsert({
          where: {
            userId_courseId: { userId, courseId },
          },
          create: { userId, courseId },
          update: {},
        });

        console.log("✅ Enrollment done");
      });

      console.log("🎉 TRANSACTION SUCCESS");
    } catch (err) {
      console.error("❌ DB ERROR:", err);
    }
  }

  console.log("🏁 WEBHOOK END");
  return res.status(200).json({ received: true });
};