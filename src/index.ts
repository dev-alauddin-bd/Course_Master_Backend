import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { baseRouter } from "./app/routes/baseRouter";
import { webhookRouter } from "./app/routes/webhook.route";

const app: Application = express();

// ==============================
// WEBHOOK ROUTE (IMPORTANT: BEFORE JSON)
// ==============================
app.use("/webhook", webhookRouter);

// ==============================
// RATE LIMITER
// ==============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, try later.",
  },
});
app.use(limiter);

// ==============================
// CORS
// ==============================
app.use(
  cors({
    origin: [process.env.FRONTEND_URL as string],
    credentials: true,
  })
);

// ==============================
// COOKIE PARSER
// ==============================
app.use(cookieParser());

// ==============================
// JSON BODY PARSER (AFTER WEBHOOK)
// ==============================
app.use(express.json());

// ==============================
// ROOT ROUTE
// ==============================
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "CourseMaster API is running 🚀",
  });
});

// ==============================
// BASE ROUTES
// ==============================
app.use("/api", baseRouter);

// ==============================
// 404 ROUTE
// ==============================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ==============================
// GLOBAL ERROR HANDLER
// ==============================
app.use(globalErrorHandler);

export default app;