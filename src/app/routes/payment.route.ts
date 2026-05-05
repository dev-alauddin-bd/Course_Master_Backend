//  ====================
//     Payment Routes
// ====================

import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { protect, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ============================== CREATE Checkout ==============================
router.post("/checkout", protect, authorize(UserRole.STUDENT), paymentController.createCheckout);
router.post("/checkout-featured", protect, authorize(UserRole.INSTRUCTOR), paymentController.createFeaturedCheckout);

// ============================== REFUND Course ==============================
router.post("/refund", protect, authorize(UserRole.STUDENT), paymentController.refundCourse);

// ============================== PAYMENT Callbacks ==============================
router.get("/success", paymentController.paymentSuccess);
router.get("/cancel", paymentController.paymentCancel);
router.get("/fail", paymentController.paymentFail);

export const paymentRouter: Router = router;
