//  ====================
//  Category Routes
// ====================

import { Router } from "express";
import { categoryController } from "../controllers/category.controller";

const router = Router();

// ==============================  Fetch all categories ==============================
//
router.get("/", categoryController.getCategories);

// ============================== Create a new category ==============================

router.post("/", categoryController.createCategory);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// ==============================  Update a specific category by ID ==============================

router.put("/:id", categoryController.updateCategory);

// ============================== Delete a specific category by ID ==============================

router.delete("/:id", categoryController.deleteCategory);

export const categoryRouter: Router = router;
