import express, { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { userController } from "../controllers/user.controller";
import { upload } from "../utils/cloudinary";

const router = express.Router();

router.get("/", protect, authorize("admin"), userController.getAllUsers);
router.post("/become-instructor", protect, userController.becomeInstructor);
router.patch("/profile", protect, upload.single("avatar"), userController.updateProfile);

export const userRouter : Router= router;

