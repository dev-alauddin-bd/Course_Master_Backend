import { Request, RequestHandler, Response } from "express";
import { paymentService } from "../services/payment.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { enrollValidation } from "../validations/enroll.validation"; // Relying on the identical validation schema

const createCheckout = catchAsyncHandler(async (req: Request, res: Response) => {
  console.log("Received payment checkout request with data:", req.body);
  
  // Validate request exactly as enroll does
  const validated = enrollValidation.parse(req.body);
  const userId = req.user!.id;

  const result = await paymentService.createCheckoutSession(userId, validated.courseId);
  console.log("payment generated:", result);

  sendResponse(res, 201, "Checkout session created", result);
});

export const paymentController: PaymentController = {
  createCheckout,
};

type PaymentController = {
  createCheckout: RequestHandler;
}