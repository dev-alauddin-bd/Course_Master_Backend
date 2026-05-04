//  ====================
//      User Routes
// ====================

import express, { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { userController } from "../controllers/user.controller";
import { upload } from "../utils/cloudinary";
import { validate } from "../middlewares/validate.middleware";
import { UserRole } from "../interfaces/user.interface";
import {
  updateProfileValidation,
  updateUserRoleValidation,
  updateUserStatusValidation,
} from "../validations/user.validation";

const router = express.Router();

// ============================== GET ALL Users (ADMIN) ==============================
router.get("/", protect, authorize(UserRole.ADMIN), userController.getAllUsers);

// ============================== UPDATE User Role (ADMIN) ==============================
router.patch("/update-role/:id", protect, authorize(UserRole.ADMIN), validate(updateUserRoleValidation), userController.updateUserRole);

// ============================== UPDATE User Status (ADMIN) ==============================
router.patch("/update-status/:id", protect, authorize(UserRole.ADMIN), validate(updateUserStatusValidation), userController.updateUserStatus);

// ============================== BECOME Instructor ==============================
router.post("/become-instructor", protect, authorize(UserRole.STUDENT, UserRole.INSTRUCTOR), userController.becomeInstructor);

// ============================== UPDATE Profile ==============================
router.patch("/profile", protect, upload.single("avatar"), validate(updateProfileValidation), userController.updateProfile);

export const userRouter: Router = router;
