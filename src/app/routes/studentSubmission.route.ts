import { Router } from "express";
import { studentSubmissionController } from "../controllers/studentSubmission.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ======================================= Submit an assignment (student)============================================
router.post("/assignments/submit", protect, authorize(UserRole.STUDENT), studentSubmissionController.submitAssignment);

export const studentSubmissionRouter : Router= router;
