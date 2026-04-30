import { Router } from "express";
import { enrollController } from "../controllers/enroll.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// ========================== Enroll in a course (for students) =============================
router.post("/", protect, enrollController.enrollCourse);

// =============================== Get my enrollments ===================================
router.get("/me", protect, enrollController.getMyEnrollments);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ===================================== Get curriculum for a specific enrolled course =================================
router.get("/courses/:courseId", protect, enrollController.getEnrolledCourseContent);

export const enrollRouter : Router= router;