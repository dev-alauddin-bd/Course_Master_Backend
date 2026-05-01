//  ====================
//     Category Routes
// ====================

import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ============================== GET ALL Categories ==============================
router.get("/", categoryController.getCategories);

// ============================== CREATE Category (ADMIN) ==============================
router.post("/", protect, authorize(UserRole.ADMIN), categoryController.createCategory);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ============================== UPDATE Category (ADMIN) ==============================
router.put("/:id", protect, authorize(UserRole.ADMIN), categoryController.updateCategory);

// ============================== DELETE Category (ADMIN) ==============================
router.delete("/:id", protect, authorize(UserRole.ADMIN), categoryController.deleteCategory);

export const categoryRouter: Router = router;
