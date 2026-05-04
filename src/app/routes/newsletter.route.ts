//  ====================
//      Newsletter Routes
// ====================

import { Router } from "express";
import { newsletterController } from "../controllers/newsletter.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { UserRole } from "../interfaces/user.interface";
import { newsletterValidation } from "../validations/newsletter.validation";

const router = Router();

// ============================== SUBSCRIBE ==============================
router.post("/subscribe", validate(newsletterValidation), newsletterController.subscribe);

// ============================== ADMIN ROUTES ==============================
router.get("/", protect, authorize(UserRole.ADMIN), newsletterController.getAllSubscribers);
router.delete("/:id", protect, authorize(UserRole.ADMIN), newsletterController.deleteSubscriber);

export const newsletterRouter: Router = router;
