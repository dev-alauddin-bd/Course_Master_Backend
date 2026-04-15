
import dotenv from "dotenv";
dotenv.config();
import app from ".";

import logger from "./lib/logger";

const PORT = Number(process.env.PORT || 5000);

async function server() {
  try {
    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

server();
