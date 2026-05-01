//  ====================
//     Lesson Routes
// ====================

import { Router } from "express";
import { lessonController } from "../controllers/lesson.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ============================== ADD Lesson (INSTRUCTOR) ==============================
router.post("/", protect, authorize(UserRole.INSTRUCTOR), lessonController.addLesson);

// ============================== GET ALL Lessons ==============================
router.get("/", protect, authorize(UserRole.INSTRUCTOR, UserRole.STUDENT), lessonController.getAllLessons);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================== GET Lesson By ID ==============================
router.get("/:lessonId", protect, lessonController.getLessonById);

// ============================== UPDATE Lesson (INSTRUCTOR) ==============================
router.patch("/:lessonId", protect, authorize(UserRole.INSTRUCTOR), lessonController.updateLesson);

// ============================== DELETE Lesson (INSTRUCTOR) ==============================
router.delete("/:lessonId", protect, authorize(UserRole.INSTRUCTOR), lessonController.deleteLesson);

export const lessonRouter: Router = router;
