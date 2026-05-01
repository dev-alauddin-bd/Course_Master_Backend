//  ====================
//      User Routes
// ====================

import express, { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { userController } from "../controllers/user.controller";
import { upload } from "../utils/cloudinary";
import { UserRole } from "../interfaces/user.interface";

const router = express.Router();

// ============================== GET ALL Users (ADMIN) ==============================
router.get("/", protect, authorize(UserRole.ADMIN), userController.getAllUsers);

// ============================== UPDATE User Role (ADMIN) ==============================
router.patch("/update-role/:id", protect, authorize(UserRole.ADMIN), userController.updateUserRole);

// ============================== UPDATE User Status (ADMIN) ==============================
router.patch("/update-status/:id", protect, authorize(UserRole.ADMIN), userController.updateUserStatus);

// ============================== BECOME Instructor ==============================
router.post("/become-instructor", protect, authorize(UserRole.STUDENT, UserRole.INSTRUCTOR), userController.becomeInstructor);

// ============================== UPDATE Profile ==============================
router.patch("/profile", protect, upload.single("avatar"), userController.updateProfile);

export const userRouter: Router = router;
