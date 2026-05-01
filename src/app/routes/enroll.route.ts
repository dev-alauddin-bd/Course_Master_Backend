//  ====================
//     Enroll Routes
// ====================

import { Router } from "express";
import { enrollController } from "../controllers/enroll.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// ============================== ENROLL In Course ==============================
router.post("/", protect, enrollController.enrollCourse);

// ============================== GET My Enrollments ==============================
router.get("/me", protect, enrollController.getMyEnrollments);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================== GET Enrolled Content ==============================
router.get("/courses/:courseId", protect, enrollController.getEnrolledCourseContent);

export const enrollRouter: Router = router;