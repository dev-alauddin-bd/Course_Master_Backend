//  ====================
//    Review Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { reviewService } from "../services/review.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";

// ============================== CREATE Review ==============================
const createReview = catchAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { content, rating, courseId } = req.body;

  const result = await reviewService.createReview({
    content,
    rating,
    userId,
    courseId,
  });

  sendResponse(res, 201, "Review submitted successfully", result);
});

// ============================== GET ALL Reviews ==============================
const getAllReviews = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.getAllReviews();
  sendResponse(res, 200, "Reviews fetched successfully", result);
});

// ============================== DELETE Review ==============================
const deleteReview = catchAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  await reviewService.deleteReview(id as string, userId);
  sendResponse(res, 200, "Review deleted successfully");
});

export const reviewController: ReviewController = {
  createReview,
  getAllReviews,
  deleteReview,
};

type ReviewController = {
  createReview: RequestHandler;
  getAllReviews: RequestHandler;
  deleteReview: RequestHandler;
}