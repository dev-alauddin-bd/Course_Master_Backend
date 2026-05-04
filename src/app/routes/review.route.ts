//  ====================
//     Review Routes
// ====================

import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { UserRole } from "../interfaces/user.interface";
import { createReviewValidation } from "../validations/review.validation";

const router = Router();

// ============================== GET ALL Reviews ==============================
router.get("/", reviewController.getAllReviews);

// ============================== CREATE Review (STUDENT) ==============================
router.post("/", protect, authorize(UserRole.STUDENT), validate(createReviewValidation), reviewController.createReview);

// ============================== DELETE Review ==============================
router.delete("/:id", protect, authorize(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN), reviewController.deleteReview);

export const reviewRoutes: Router = router;

