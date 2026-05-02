//  ====================
//     Newsletter Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { newsletterService } from "../services/newsletter.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { newsletterValidation } from "../validations/newsletter.validation";

// ============================== SUBSCRIBE ==============================
const subscribe = catchAsyncHandler(async (req: Request, res: Response) => {
  const validated = newsletterValidation.parse(req.body);
  const result = await newsletterService.subscribe(validated.email);
  sendResponse(res, 201, "Subscribed successfully", result);
});

// ============================== GET ALL Subscribers ==============================
const getAllSubscribers = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await newsletterService.getAllSubscribers(req.query);
  sendResponse(res, 200, "Subscribers fetched successfully", result);
});

// ============================== DELETE Subscriber ==============================
const deleteSubscriber = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await newsletterService.deleteSubscriber(req.params.id as string);
  sendResponse(res, 200, "Subscriber deleted successfully", result);
});

export const newsletterController: NewsletterController = {
  subscribe,
  getAllSubscribers,
  deleteSubscriber,
};

type NewsletterController = {
  subscribe: RequestHandler;
  getAllSubscribers: RequestHandler;
  deleteSubscriber: RequestHandler;
}
