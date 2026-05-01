//  ====================
//    Dashboard Routes
// ====================

import express, { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { dashboardController } from "../controllers/dashboard.controller";
import { UserRole } from "../interfaces/user.interface";

const router = express.Router();

// ============================== GET Analytics ==============================
router.get("/analytics", protect, authorize(UserRole.ADMIN, UserRole.STUDENT, UserRole.INSTRUCTOR), dashboardController.getDashboardAnalytics);

export const dashboardRouter: Router = router;
