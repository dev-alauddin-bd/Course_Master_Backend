import Redis from "ioredis";
import logger from "./logger";

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const redis = new Redis(redisConfig);

redis.on("connect", () => {
  logger.info("🚀 Redis connected successfully");
});

redis.on("error", (err) => {
  logger.error("❌ Redis connection error:", err);
});

export default redis;
