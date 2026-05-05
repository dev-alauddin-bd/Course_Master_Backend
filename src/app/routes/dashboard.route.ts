//  ====================
//    Dashboard Routes
// ====================

import express, { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { dashboardController } from "../controllers/dashboard.controller";
import { UserRole } from "../interfaces/user.interface";

const router = express.Router();

// ============================== GET Analytics ==============================
router.get("/admin-analytics", protect, authorize(UserRole.ADMIN), dashboardController.getAdminAnalytics);
router.get("/instructor-analytics", protect, authorize(UserRole.INSTRUCTOR), dashboardController.getInstructorAnalytics);
router.get("/student-analytics", protect, authorize(UserRole.STUDENT), dashboardController.getStudentAnalytics);


export const dashboardRouter: Router = router;
