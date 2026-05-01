//  ====================
//     Review Routes
// ====================

import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ============================== GET ALL Reviews ==============================
router.get("/", reviewController.getAllReviews);

// ============================== CREATE Review (STUDENT) ==============================
router.post("/", protect, authorize(UserRole.STUDENT), reviewController.createReview);

// ============================== DELETE Review ==============================
router.delete("/:id", protect, authorize(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN), reviewController.deleteReview);

export const reviewRoutes: Router = router;
