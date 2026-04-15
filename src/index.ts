import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { baseRouter } from "./app/routes/baseRouter";
import { webhookRouter } from "./app/routes/webhook.route";

const app: Application = express();

// ==============================
// TRUST PROXY (IMPORTANT for Render / VPS)
// ==============================
app.set("trust proxy", 1);

// ==============================
// WHITELIST (for k6 / testing)
// ==============================
const whitelist = ["103.197.250.67"]; // তোমার IP

// ==============================
// RATE LIMITER
// ==============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests per IP
  message: {
    success: false,
    message: "Too many requests, try later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==============================
// CUSTOM RATE LIMIT + WHITELIST LOGIC
// ==============================
const rateLimitWithWhitelist = (req: Request, res: Response, next: any) => {
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.socket.remoteAddress ||
    "";

  if (whitelist.includes(ip)) {
    return next(); // bypass rate limit
  }

  return limiter(req, res, next);
};

// ==============================
// WEBHOOK ROUTE (BEFORE JSON)
// ==============================
app.use("/webhook", webhookRouter);

// ==============================
// APPLY RATE LIMIT (GLOBAL)
// ==============================
app.use(rateLimitWithWhitelist);

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
// JSON BODY PARSER
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