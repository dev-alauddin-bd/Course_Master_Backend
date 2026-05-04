//  ====================
//    Review Controller
// ====================

import { Request, RequestHandler, Response } from "express";
import { reviewService } from "../services/review.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { notificationService } from "../services/notification.service";
import { prisma } from "../../lib/prisma";

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

  try {
    // 🔒 SECURITY FIX: Only notify admin and course instructor about new review
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    });

    if (course) {
      await notificationService.notifyAdminAndInstructor(
        {
          message: "⭐ A new review has been submitted!",
          type: "success",
          data: { courseId, reviewerId: userId, rating }
        },
        course.instructorId
      );
    }
  } catch (_err) {
    // Socket emit failed, ignore for now
  }

  sendResponse(res, 201, "Review submitted successfully", result);
});

// ============================== GET ALL Reviews ==============================
const getAllReviews = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.getAllReviews(req.query);
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