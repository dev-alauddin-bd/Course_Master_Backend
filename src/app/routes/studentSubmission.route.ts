//  ====================
//   Student Submission
//       Routes
// ====================

import { Router } from "express";
import { studentSubmissionController } from "../controllers/studentSubmission.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { UserRole } from "../interfaces/user.interface";
import { submitAssignmentValidation } from "../validations/studentSubmission.validation";

const router = Router();

// ============================== SUBMIT Assignment (STUDENT) ==============================
router.post("/assignments/submit", protect, authorize(UserRole.STUDENT), validate(submitAssignmentValidation), studentSubmissionController.submitAssignment);

export const studentSubmissionRouter: Router = router;
