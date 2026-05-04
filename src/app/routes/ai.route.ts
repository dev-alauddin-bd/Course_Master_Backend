//  ====================
//       AI Routes
// ====================

import { Router } from "express";
import { AiController } from "../controllers/ai.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ============================== CHAT Assistant ==============================
// Public — no auth required
router.post("/chat", AiController.chatAssistant);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================== GENERATE Quiz ==============================
router.get("/generate-quiz/:lessonId", protect, authorize(UserRole.INSTRUCTOR, UserRole.STUDENT), AiController.generateQuiz);

export const aiRouter: Router = router;
