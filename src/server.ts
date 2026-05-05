import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from ".";
import logger from "./lib/logger";

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

function startServer() {
  try {
    // CREATE HTTP SERVER (CRITICAL FIX)
    const httpServer = http.createServer(app);

 
    // START LISTEN
    httpServer.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });

    // SAFETY HANDLERS
    process.on("unhandledRejection", (err) => {
      logger.error("❌ Unhandled Rejection:", err);
    });

    process.on("uncaughtException", (err) => {
      logger.error("❌ Uncaught Exception:", err);
    });
  } catch (error) {
    logger.error("❌ Server failed:", error);
    process.exit(1);
  }
}

startServer();
