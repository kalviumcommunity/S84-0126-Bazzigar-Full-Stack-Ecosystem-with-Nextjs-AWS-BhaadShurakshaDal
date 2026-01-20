import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  enableReadyCheck: false,
  enableOfflineQueue: false,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

redis.on("connect", () => {
  console.log("✅ Redis Connected");
});

redis.on("reconnecting", () => {
  console.warn("⚠️ Redis Reconnecting...");
});

export default redis;
