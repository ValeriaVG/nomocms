import Redis from "ioredis";
import { redis as redisUrl } from "../config";

export const redis = new Redis(redisUrl, { lazyConnect: true });

redis
  .connect()
  .then(() => {
    console.log("✅ Redis connection: OK");
  })
  .catch((error) => {
    console.error("🚨 Redis connection: ", error.message);
    process.exit(1);
  });

export const log = console;
