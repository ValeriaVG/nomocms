import { Pool } from "pg";
import Redis from "ioredis";
import { redis as redisUrl, db as databaseConfig } from "../config";

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

export const db = new Pool(databaseConfig);

db.connect()
  .then(() => {
    console.log("✅ PostgreSQL connection: OK");
  })
  .catch((error) => {
    console.error("🚨 PostgreSQL connection: ", error.message);
    process.exit(1);
  });

export const log = console;
