import { Router } from "express";
import express from 'express';
import { stripeWebhook } from "../controllers/webhook.controller";

const router = Router();

// ======================================= Stripe Webhook (Public) =======================================
router.post(
  "/",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
export const webhookRouter: Router = router;