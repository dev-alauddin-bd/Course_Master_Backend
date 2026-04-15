import Redis from "ioredis";
import logger from "./logger";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis(process.env.REDIS_URL);  
redis.on("connect", () => {
  logger.info("🚀 Redis connected successfully");
});

redis.on("error", (err) => {
  logger.error("❌ Redis connection error:", err);
});

export default redis;
