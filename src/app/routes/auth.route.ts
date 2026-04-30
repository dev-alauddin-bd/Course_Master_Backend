//  ====================
//  Auth Routes
// ====================

import { Router } from "express";
import { authControllers } from "../controllers/auth.controller";

const router = Router();

// ============================== signup  ==============================

router.post("/signup", authControllers.signup);

// ============================== login  ==============================

router.post("/login", authControllers.login);

// =============================Sync Firebase user ==============================
router.post("/sync-firebase", authControllers.syncFirebase);

// ============================== Refresh the access token using the refresh token ==============================

router.get("/refresh-token", authControllers.refreshToken);

export const authRouter : Router= router;
