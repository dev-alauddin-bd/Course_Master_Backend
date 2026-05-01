//  ====================
//      Auth Routes
// ====================

import { Router } from "express";
import { authControllers } from "../controllers/auth.controller";

const router = Router();

// ============================== SIGNUP ==============================
router.post("/signup", authControllers.signup);

// ============================== LOGIN ==============================
router.post("/login", authControllers.login);

// ============================== SYNC Firebase ==============================
router.post("/sync-firebase", authControllers.syncFirebase);

// ============================== REFRESH Token ==============================
router.get("/refresh-token", authControllers.refreshToken);

export const authRouter: Router = router;
