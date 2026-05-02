
import dotenv from "dotenv";
dotenv.config();
import app from ".";

import logger from "./lib/logger";
import { initSocket } from "./lib/socket";

const PORT = Number(process.env.PORT || 5000);

async function server() {
  try {
    const server = app.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Server listening on port ${PORT}`);
    });

    // Initialize Socket.IO with the HTTP server
    initSocket(server);
  } catch (err) {
    logger.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

server();
