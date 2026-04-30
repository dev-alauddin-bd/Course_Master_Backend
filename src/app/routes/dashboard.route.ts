import express, { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { dashboardController } from "../controllers/dashboard.controller";

const router = express.Router();

// ========================================== Analytics ==================================================
router.get("/analytics",protect, authorize("admin", "student", "instructor"), dashboardController.getDashboardAnalytics);

export const dashboardRouter : Router= router;
