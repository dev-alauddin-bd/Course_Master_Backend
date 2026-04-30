//  ====================
//  Assignment Routes
// ====================

import { Router } from "express";
import { assignmentController } from "../controllers/assignment.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";
const router = Router();


// ============================== CREATE Assignment ==============================
router.post("/", protect, authorize(UserRole.INSTRUCTOR), assignmentController.createAssignment);

// ============================== GET All Assignments created by specific instructor to display in admin dashboard ==============================
router.get("/", protect, authorize(UserRole.INSTRUCTOR), assignmentController.getAssignmentsIntoIntrutorCourses);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// =============================UPDATE Assignment ==============================
router.patch("/:id", protect, authorize(UserRole.INSTRUCTOR), assignmentController.updateAssignment);
// ============================ DELETE Assignment ==============================
router.delete("/:id", protect, authorize(UserRole.ADMIN), assignmentController.deleteAssignment);

export const assignmentRouter: Router = router;

