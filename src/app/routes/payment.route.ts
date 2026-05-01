//  ====================
//     Payment Routes
// ====================

import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// ============================== CREATE Checkout ==============================
router.post("/checkout", protect, paymentController.createCheckout);

export const paymentRouter: Router = router;
