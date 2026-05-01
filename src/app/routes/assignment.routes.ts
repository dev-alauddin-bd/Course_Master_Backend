//  ====================
//   Assignment Routes
// ====================

import { Router } from "express";
import { assignmentController } from "../controllers/assignment.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ============================== CREATE Assignment (INSTRUCTOR) ==============================
router.post("/", protect, authorize(UserRole.INSTRUCTOR), assignmentController.createAssignment);

// ============================== GET Instructor Assignments ==============================
router.get("/", protect, authorize(UserRole.INSTRUCTOR), assignmentController.getAssignmentsIntoIntrutorCourses);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================== UPDATE Assignment (INSTRUCTOR) ==============================
router.patch("/:id", protect, authorize(UserRole.INSTRUCTOR), assignmentController.updateAssignment);

// ============================== DELETE Assignment (ADMIN) ==============================
router.delete("/:id", protect, authorize(UserRole.ADMIN), assignmentController.deleteAssignment);

export const assignmentRouter: Router = router;
