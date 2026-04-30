// routes/module.routes.ts
import { Router } from "express";
import { moduleController } from "../controllers/module.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router({ mergeParams: true });


// ===================================Add a new module =============================================
router.post("/", protect, authorize(UserRole.INSTRUCTOR), moduleController.addModule);

// ====================================== Get all modules =============================================
router.get("/", moduleController.getAllModules);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================================ Update a module (Instructor only) =========================================
router.patch("/:moduleId", protect, authorize(UserRole.INSTRUCTOR), moduleController.updateModule);

// ======================================== Delete a module (Instructor only) ===============================================
router.delete("/:moduleId",protect, authorize(UserRole.INSTRUCTOR),moduleController.deleteModule);

// ================================================= Get modules for a specific course (student only) ========================================
router.get(
  "/:courseId",
  protect,
  authorize(UserRole.STUDENT),
  moduleController.getModuleByCourseId
);



export const moduleRouter : Router= router;
