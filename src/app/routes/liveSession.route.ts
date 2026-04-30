import express, { Router } from "express";
import { liveSessionController } from "../controllers/liveSession.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", liveSessionController.getAllSessions);
router.get("/:id", liveSessionController.getSessionById);

// Protected routes for management
router.post("/", protect, authorize("admin", "instructor"), liveSessionController.createSession);
router.patch("/:id", protect, authorize("admin", "instructor"), liveSessionController.updateSession);
router.delete("/:id", protect, authorize("admin", "instructor"), liveSessionController.deleteSession);
router.get("/:id/registrants", protect, authorize("admin", "instructor"), liveSessionController.getRegistrants);

router.post("/register", protect, liveSessionController.registerForSession);

export const liveSessionRoutes:Router= router;
