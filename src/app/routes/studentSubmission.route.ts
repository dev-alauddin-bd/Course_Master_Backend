//  ====================
//   Student Submission
//       Routes
// ====================

import { Router } from "express";
import { studentSubmissionController } from "../controllers/studentSubmission.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ============================== SUBMIT Assignment (STUDENT) ==============================
router.post("/assignments/submit", protect, authorize(UserRole.STUDENT), studentSubmissionController.submitAssignment);

export const studentSubmissionRouter: Router = router;
