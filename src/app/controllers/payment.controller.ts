//  ====================
//   Payment Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { paymentService } from "../services/payment.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { enrollValidation } from "../validations/enroll.validation";

// ============================== CREATE Checkout ==============================
const createCheckout = catchAsyncHandler(async (req: Request, res: Response) => {
  const validated = enrollValidation.parse(req.body);
  const userId = req.user!.id;
  const result = await paymentService.createCheckoutSession(userId, validated.courseId);
  sendResponse(res, 201, "Checkout session created", result);
});

export const paymentController: PaymentController = {
  createCheckout,
};

type PaymentController = {
  createCheckout: RequestHandler;
}