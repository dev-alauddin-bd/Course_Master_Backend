import express, { Router } from "express";
import { liveSessionController } from "../controllers/liveSession.controller";

const router = express.Router();

router.get("/", liveSessionController.getAllSessions);
router.get("/:id", liveSessionController.getSessionById);
router.post("/", liveSessionController.createSession); // Admin/Instructor
router.patch("/:id", liveSessionController.updateSession); // Admin/Instructor
router.delete("/:id", liveSessionController.deleteSession); // Admin/Instructor
router.get("/:id/registrants", liveSessionController.getRegistrants); // Admin/Instructor
router.post("/register", liveSessionController.registerForSession); // Public

export const liveSessionRoutes:Router= router;
