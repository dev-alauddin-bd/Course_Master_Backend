import express, { Router } from "express";
import { liveSessionController } from "../controllers/liveSession.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = express.Router();
// =================================== Create LiveSession (Instaructor only) ==================================
router.post("/", protect, authorize(UserRole.INSTRUCTOR), liveSessionController.createSession);
// ==================================== Get all live Sessions ===========================================
router.get("/", liveSessionController.getAllSessions);

// ==============================================  Register For session ===================================
router.post("/register", protect, liveSessionController.registerForSession);


// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ===================================== Get LiveSession By Id =========================================
router.get("/:id", liveSessionController.getSessionById);

//  ==================================== Update livesession by Id (Instructor only) ===================================

router.patch("/:id", protect, authorize(UserRole.INSTRUCTOR), liveSessionController.updateSession);

//  ==================================== Delete livesession by Id (Instructor only) ===================================

router.delete("/:id", protect, authorize(UserRole.INSTRUCTOR), liveSessionController.deleteSession);


//  ==================================== Registrants (Instructor only) ===================================

router.get("/:id/registrants", protect, authorize(UserRole.INSTRUCTOR), liveSessionController.getRegistrants);


export const liveSessionRoutes: Router = router;
