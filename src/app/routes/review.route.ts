import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();
// ============================================  Get reviews (public) ===========================================
router.get("/", reviewController.getAllReviews);
//  =========================================== Create Review (Student only) ============================================
router.post("/", protect, authorize(UserRole.STUDENT), reviewController.createReview);
//  ============================================ Delete Review (Student, Instructor & Admin) ============================================
router.delete("/:id", protect, authorize(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN), reviewController.deleteReview);

export const reviewRoutes: Router = router;
