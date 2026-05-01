//  ====================
//     Course Routes
// ====================

import { Router } from "express";
import { courseController } from "../controllers/course.controller";
import { authorize, protect, optionalProtect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ============================== CREATE Course (INSTRUCTOR) ==============================
router.post("/", protect, authorize(UserRole.INSTRUCTOR), courseController.createCourse);

// ============================== GET ALL Courses (PUBLIC) ==============================
router.get("/", courseController.getAllCourses);

// ============================== GET My Enrolled Courses ==============================
router.get("/my-courses", protect, courseController.getMyCourses);

// ============================== MARK Lesson Completed ==============================
router.post("/complete-lesson", protect, courseController.completeLesson);

// ============================== GET Recommendations ==============================
router.get("/recommendations", protect, courseController.getRecommendations);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================== GET Course By ID ==============================
router.get("/:id", optionalProtect, courseController.getCourseById);

// ============================== UPDATE Course ==============================
router.put("/:id", protect, authorize(UserRole.ADMIN, UserRole.INSTRUCTOR), courseController.updateCourse);

// ============================== TOGGLE Publish Status ==============================
router.patch("/:id/toggle-publish", protect, authorize(UserRole.ADMIN, UserRole.INSTRUCTOR), courseController.togglePublish);

// ============================== DELETE Course (ADMIN) ==============================
router.delete("/:id", protect, authorize(UserRole.ADMIN), courseController.deleteCourse);

export const courseRouter: Router = router;