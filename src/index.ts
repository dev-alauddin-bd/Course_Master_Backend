import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { baseRouter } from "./app/routes/baseRouter";
import { webhookRouter } from "./app/routes/webhook.route";

const app: Application = express();

// ==============================
// TRUST PROXY (Railway / Render safe)
// ==============================
app.set("trust proxy", 1);

// ==============================
// SECURITY HEADERS (lightweight protection)
// ==============================
app.disable("x-powered-by");

// ==============================
// HEALTH CHECK
// ==============================
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server healthy 🚀",
    uptime: process.uptime(),
  });
});

// ==============================
// WHITELIST (optional but production useful)
// ==============================
const whitelist = process.env.IP_WHITELIST?.split(",") || [];

// ==============================
// RATE LIMIT (global safety)
// ==============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Try later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==============================
// CUSTOM RATE LIMIT WITH WHITELIST
// ==============================
const rateLimitWithWhitelist = (req: Request, res: Response, next: any) => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress ||
    "";

  if (whitelist.includes(ip)) {
    return next();
  }

  return limiter(req, res, next);
};

// ==============================
// MIDDLEWARES
// ==============================
app.use(rateLimitWithWhitelist);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// ==============================
// WEBHOOK (before JSON heavy routes)
// ==============================
app.use("/webhook", webhookRouter);

// ==============================
// API ROUTES
// ==============================
app.use("/api", baseRouter);

// ==============================
// ROOT ROUTE
// ==============================
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "CourseMaster API v3 🚀",
  });
});

// ==============================
// 404 HANDLER
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