import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { baseRouter } from "./app/routes/baseRouter";
import { webhookRouter } from "./app/routes/webhook.route";

const app: Application = express();

app.set("trust proxy", 1);

// ==============================
// ROUTES
// ==============================
app.use("/webhook", webhookRouter);

// ==============================
// RATE LIMIT
// ==============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// ==============================
// CORS
// ==============================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// ==============================
// HEALTH CHECK (IMPORTANT FOR RAILWAY)
// ==============================
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API is running 🚀",
  });
});

// ==============================
app.use("/api", baseRouter);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use(globalErrorHandler);

export default app;