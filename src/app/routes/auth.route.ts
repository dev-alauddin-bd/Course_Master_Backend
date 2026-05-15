//  ====================
//      Auth Routes
// ====================

import { Router } from "express";
import { authControllers } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  signupValidation,
  loginValidation,
  syncFirebaseValidation,
} from "../validations/auth.validation";

const router = Router();

// ============================== SIGNUP ==============================
router.post("/signup", validate(signupValidation), authControllers.signup);

// ============================== LOGIN ==============================
router.post("/login", validate(loginValidation), authControllers.login);

// ============================== SYNC Firebase ==============================
router.post("/sync-firebase", validate(syncFirebaseValidation), authControllers.syncFirebase);

// ============================== REFRESH Token ==============================
router.get("/refresh-token", authControllers.refreshToken);

// ============================== VERIFY Session ==============================
router.get("/verify-session", authControllers.verifySession);

// ============================== LOGOUT ==============================
router.post("/logout", authControllers.logout);

export const authRouter: Router = router;
