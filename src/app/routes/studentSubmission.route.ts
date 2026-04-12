import { Router } from "express";
import { studentSubmissionController } from "../controllers/studentSubmission.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// Submit an assignment (student)
router.post("/assignments/submit", protect, studentSubmissionController.submitAssignment);

export const studentSubmissionRouter : Router= router;
