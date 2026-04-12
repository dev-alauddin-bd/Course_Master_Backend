import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// Process checkout (for students)
router.post("/checkout", protect, paymentController.createCheckout);

export const paymentRouter : Router = router;
