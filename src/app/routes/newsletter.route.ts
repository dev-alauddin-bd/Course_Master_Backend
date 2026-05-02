//  ====================
//      Newsletter Routes
// ====================

import { Router } from "express";
import { newsletterController } from "../controllers/newsletter.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ============================== SUBSCRIBE ==============================
router.post("/subscribe", newsletterController.subscribe);

// ============================== ADMIN ROUTES ==============================
router.get("/", protect, authorize(UserRole.ADMIN), newsletterController.getAllSubscribers);
router.delete("/:id", protect, authorize(UserRole.ADMIN), newsletterController.deleteSubscriber);

export const newsletterRouter: Router = router;
