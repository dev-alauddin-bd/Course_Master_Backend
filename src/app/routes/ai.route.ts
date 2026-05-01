//  ====================
//       AI Routes
// ====================

import { Router } from "express";
import { AiController } from "../controllers/ai.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// ============================== CHAT Assistant ==============================
router.post("/chat", protect, AiController.chatAssistant);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================== GENERATE Quiz ==============================
router.get("/generate-quiz/:lessonId", protect, AiController.generateQuiz);

export const aiRouter: Router = router;
