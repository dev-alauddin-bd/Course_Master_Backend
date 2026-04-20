import { Router } from "express";
import { AiController } from "../controllers/ai.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/chat", protect, AiController.chatAssistant);
router.get("/generate-quiz/:lessonId", protect, AiController.generateQuiz);
router.get("/search", AiController.searchAssistant);
router.get("/recommendations", protect, AiController.getRecommendations);

export const aiRouter:Router = router;
