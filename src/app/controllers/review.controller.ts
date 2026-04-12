import { RequestHandler } from "express";
import { reviewService } from "../services/review.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";

const createReview = catchAsyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  const { content, rating, courseId } = req.body;

  const result = await reviewService.createReview({
    content,
    rating,
    userId,
    courseId,
  });

  res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
});

const getAllReviews= catchAsyncHandler(async (req, res) => {
  const result = await reviewService.getAllReviews();

  res.status(200).json({
    success: true,
    data: result,
  });
});

const deleteReview = catchAsyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  await reviewService.deleteReview(id as string, userId);

  res.status(200).json({
    success: true,
    message: "Review deleted",
  });
});

export const reviewController : ReviewController= {
  createReview,
  getAllReviews,
  deleteReview,
};
type ReviewController = {
  createReview: RequestHandler;
  getAllReviews: RequestHandler;
  deleteReview: RequestHandler;
}