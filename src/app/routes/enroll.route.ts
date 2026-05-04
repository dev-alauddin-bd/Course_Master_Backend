//  ====================
//     Enroll Routes
// ====================

import { Router } from "express";
import { enrollController } from "../controllers/enroll.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { enrollValidation } from "../validations/enroll.validation";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ============================== ENROLL In Course ==============================
router.post("/", protect, authorize(UserRole.STUDENT), validate(enrollValidation), enrollController.enrollCourse);

// ============================== GET My Enrollments ==============================
router.get("/me", protect, authorize(UserRole.STUDENT), enrollController.getMyEnrollments);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================== GET Enrolled Content ==============================
router.get("/courses/:courseId", protect, authorize(UserRole.STUDENT), enrollController.getEnrolledCourseContent);

export const enrollRouter: Router = router;