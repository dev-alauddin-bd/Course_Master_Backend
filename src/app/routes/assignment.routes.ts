//  ====================
//   Assignment Routes
// ====================

import { Router } from "express";
import { assignmentController } from "../controllers/assignment.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { UserRole } from "../interfaces/user.interface";
import {
  createAssignmentValidation,
  updateAssignmentValidation,
} from "../validations/assignment.validation";

const router = Router();

// ============================== CREATE Assignment (INSTRUCTOR) ==============================
router.post("/", protect, authorize(UserRole.INSTRUCTOR), validate(createAssignmentValidation), assignmentController.createAssignment);

// ============================== GET Instructor Assignments ==============================
router.get("/", protect, authorize(UserRole.INSTRUCTOR), assignmentController.getAssignmentsIntoIntrutorCourses);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================== UPDATE Assignment (INSTRUCTOR) ==============================
router.patch("/:id", protect, authorize(UserRole.INSTRUCTOR), validate(updateAssignmentValidation), assignmentController.updateAssignment);

// ============================== DELETE Assignment (ADMIN) ==============================
router.delete("/:id", protect, authorize(UserRole.ADMIN), assignmentController.deleteAssignment);

export const assignmentRouter: Router = router;

