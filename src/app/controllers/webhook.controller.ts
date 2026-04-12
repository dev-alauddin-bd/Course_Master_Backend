import { Request, RequestHandler, Response } from "express";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";

const stripeWebhook = catchAsyncHandler(async (req: Request, res: Response) => {
  // Stripe requires the raw body to verify the signature, so we need to access it directly
  console.log("Received Stripe webhook with headers:", req.headers, "and body:", req.body);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ checkout completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const { courseId, userId } = session.metadata;

    try {
      await prisma.$transaction(async (tx:any) => {
        await tx.payment.update({
          where: { stripeSessionId: session.id },
          data: {
            status: "completed",
            stripePaymentId: session.payment_intent as string,
          },
        });

        await tx.enrollment.upsert({
          where: { userId_courseId: { userId, courseId } },
          create: { userId, courseId },
          update: {},
        });
      });
    } catch (err) {
      console.error("Database transaction failed:", err);
      return res.status(500).send("Database transaction error");
    }
  }

  // ❌ expired session
  else if (event.type === "checkout.session.expired") {
    const session = event.data.object as any;

    try {
      await prisma.payment.updateMany({
        where: {
          stripeSessionId: session.id,
          status: "pending",
        },
        data: { status: "failed" },
      });
    } catch (err) {
      console.error("Failed to mark session as failed", err);
    }
  }

  // 💸 refund
  else if (event.type === "charge.refunded") {
    const charge = event.data.object as any;

    try {
      const payment = await prisma.payment.findFirst({
        where: {
          stripePaymentId: charge.payment_intent as string,
        },
      });

      if (payment) {
        await prisma.$transaction(async (tx:any) => {
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
      }
    } catch (err) {
      console.error("Failed to process refund event", err);
    }
  }

  res.status(200).json({ received: true });
});

export const webhookController: WebhookController = {
  stripeWebhook,
};

type WebhookController = {
  stripeWebhook: RequestHandler;
}