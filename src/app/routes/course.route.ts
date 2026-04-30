// ======================
//  Course Routes 
// ======================

import { Router } from "express";
import { courseController } from "../controllers/course.controller";
import { authorize, protect, optionalProtect } from "../middlewares/auth.middleware";

const router = Router();

// ==============================  CREATE a course (Instructior only) ==============================

router.post("/", protect, authorize("instructor"), courseController.createCourse);


// ============================== GET all courses (Public) ==============================
router.get("/", courseController.getAllCourses);


// ================================== Get courses the current user is enrolled in ==========================
router.get("/my-courses", protect, courseController.getMyCourses);

// ===================================== Mark a lesson as completed ======================================
router.post("/complete-lesson", protect, courseController.completeLesson);

//  ======================================== recomendations Courses ================================
router.get("/recommendations", protect, courseController.getRecommendations);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// =========================================Get course by ID===========================================
router.get("/:id", optionalProtect, courseController.getCourseById);

// =================================================Update a course by ID================================
router.put("/:id", protect, authorize("admin", "instructor"), courseController.updateCourse);

// ======================================Toggle course publish status======================================
router.patch("/:id/toggle-publish", protect, authorize("admin", "instructor"), courseController.togglePublish);

// ========================================Delete a course by ID (Admin only)===================================
router.delete("/:id", protect, authorize("admin"), courseController.deleteCourse);


export const courseRouter: Router = router;