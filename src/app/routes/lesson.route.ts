import { Router } from "express";
import { lessonController } from "../controllers/lesson.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();


//  ================================== Add a new lesson to a module (INSTRUCTOR only) =========================================
router.post("/", protect, authorize(UserRole.INSTRUCTOR), lessonController.addLesson);

// ============================= Get all lessons (Instructor & Student only) ================================
router.get("/", protect, authorize(UserRole.INSTRUCTOR, UserRole.STUDENT), lessonController.getAllLessons);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ========================================= Get a specific lesson by ID =====================================
router.get("/:lessonId", protect, lessonController.getLessonById);

// ===================================== Update a lesson (INSTRUCTOR only) ===============================================
router.patch("/:lessonId", protect, authorize(UserRole.INSTRUCTOR), lessonController.updateLesson);

// ===================================== Soft Delete a lesson (INSTRUCTOR only) ===============================================
router.delete("/:lessonId", protect, authorize(UserRole.INSTRUCTOR), lessonController.deleteLesson);




export const lessonRouter: Router = router;
