//  ====================
//      Job Routes
// ====================

import { Router } from "express";
import { jobController } from "../controllers/job.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ============================== GET ALL Jobs ==============================
router.get("/", jobController.getAllJobs);

// ============================== APPLY For Job ==============================
router.post("/apply", jobController.applyForJob);

// ============================== CREATE Job (ADMIN) ==============================
router.post("/", protect, authorize(UserRole.ADMIN), jobController.createJob);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================== GET Admin Applications ==============================
router.get("/admin/applications", protect, authorize(UserRole.ADMIN), jobController.getAllApplications);

// ============================== GET Single Job ==============================
router.get("/:id", jobController.getJobById);

// ============================== UPDATE Job (ADMIN) ==============================
router.patch("/:id", protect, authorize(UserRole.ADMIN), jobController.updateJob);

// ============================== DELETE Job (ADMIN) ==============================
router.delete("/:id", protect, authorize(UserRole.ADMIN), jobController.deleteJob);

export const jobRouter: Router = router;
