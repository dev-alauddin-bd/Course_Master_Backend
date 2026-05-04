//  ====================
//   Live Session Routes
// ====================

import express, { Router } from "express";
import { liveSessionController } from "../controllers/liveSession.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { UserRole } from "../interfaces/user.interface";
import {
  createLiveSessionValidation,
  updateLiveSessionValidation,
  registerSessionValidation,
} from "../validations/liveSession.validation";

const router = express.Router();

// ============================== CREATE Session (INSTRUCTOR) ==============================
router.post("/", protect, authorize(UserRole.INSTRUCTOR), validate(createLiveSessionValidation), liveSessionController.createSession);

// ============================== GET ALL Sessions ==============================
router.get("/", liveSessionController.getAllSessions);

// ============================== REGISTER For Session ==============================
router.post("/register", protect, validate(registerSessionValidation), liveSessionController.registerForSession);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================== GET Session By ID ==============================
router.get("/:id", liveSessionController.getSessionById);

// ============================== UPDATE Session (INSTRUCTOR) ==============================
router.patch("/:id", protect, authorize(UserRole.INSTRUCTOR), validate(updateLiveSessionValidation), liveSessionController.updateSession);

// ============================== DELETE Session (INSTRUCTOR) ==============================
router.delete("/:id", protect, authorize(UserRole.INSTRUCTOR), liveSessionController.deleteSession);

// ============================== GET Registrants (INSTRUCTOR) ==============================
router.get("/:id/registrants", protect, authorize(UserRole.INSTRUCTOR), liveSessionController.getRegistrants);

export const liveSessionRoutes: Router = router;
