/* istanbul ignore file */
import { Pool } from "pg";
import Redis from "ioredis";
import { redis as redisUrl, db as databaseConfig } from "../config";

const context: Partial<{ db: Pool; redis: Redis.Redis }> = {};

export const setupDB = async () => {
  const db = new Pool(databaseConfig);
  try {
    await db.query("SELECT 1");
    console.info("✅ PostgreSQL connection: OK");
    return db;
  } catch (error) {
    console.error("🚨 PostgreSQL connection: NOT OK");
    throw error;
  }
};
export const setupRedis = async () => {
  try {
    const redis = new Redis(redisUrl, { lazyConnect: true });
    await redis.connect();
    console.info("✅ Redis connection: OK");
    return redis;
  } catch (error) {
    console.error("🚨 Redis connection: NOT OK");
    throw error;
  }
};

export const setup = async () => {
  const db = await setupDB();
  const redis = await setupRedis();
  context.db = db;
  context.redis = redis;
  return { db, redis, log: console };
};
export const cleanup = async () => {
  await context?.redis.disconnect();
  await context?.db.end();
};
