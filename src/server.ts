import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from ".";
import logger from "./lib/logger";
import { initSocket } from "./lib/socket";

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

function startServer() {
  try {
    // 🔥 1. CREATE HTTP SERVER (CRITICAL FIX)
    const httpServer = http.createServer(app);

    // 🔥 2. INIT SOCKET.IO
    initSocket(httpServer);

    // 🔥 3. START LISTEN
    httpServer.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });

    // 🔥 4. SAFETY HANDLERS
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
