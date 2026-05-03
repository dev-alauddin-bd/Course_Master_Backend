//  ====================
//     Payment Routes
// ====================

import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// ============================== CREATE Checkout ==============================
router.post("/checkout", protect, paymentController.createCheckout);

// ============================== PAYMENT Callbacks ==============================
router.get("/success", paymentController.paymentSuccess);
router.get("/cancel", paymentController.paymentCancel);
router.get("/fail", paymentController.paymentFail);

export const paymentRouter: Router = router;
