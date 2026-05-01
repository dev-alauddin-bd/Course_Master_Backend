//  ====================
//     Module Routes
// ====================

import { Router } from "express";
import { moduleController } from "../controllers/module.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router({ mergeParams: true });

// ============================== ADD Module (INSTRUCTOR) ==============================
router.post("/", protect, authorize(UserRole.INSTRUCTOR), moduleController.addModule);

// ============================== GET ALL Modules ==============================
router.get("/", moduleController.getAllModules);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================== GET Module By Course ID (STUDENT) ==============================
router.get("/:courseId", protect, authorize(UserRole.STUDENT), moduleController.getModuleByCourseId);

// ============================== UPDATE Module (INSTRUCTOR) ==============================
router.patch("/:moduleId", protect, authorize(UserRole.INSTRUCTOR), moduleController.updateModule);

// ============================== DELETE Module (INSTRUCTOR) ==============================
router.delete("/:moduleId", protect, authorize(UserRole.INSTRUCTOR), moduleController.deleteModule);

export const moduleRouter: Router = router;
