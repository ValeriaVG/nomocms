import { Pool, PoolClient } from "pg";
import Redis from "ioredis";
import { redis as redisUrl, db as databaseConfig } from "../config";

const redis = new Redis(redisUrl, { lazyConnect: true });
const pool = new Pool(databaseConfig);
let db: PoolClient;
const log = console;

export const setup = async () => {
  try {
    db = await pool.connect();
    console.log("✅ PostgreSQL connection: OK");
  } catch (error) {
    console.error("🚨 PostgreSQL connection: NOT OK");
    throw error;
  }
  try {
    await redis.connect();
    console.log("✅ Redis connection: OK");
  } catch (error) {
    console.error("🚨 Redis connection: NOT OK");
    throw error;
  }
  return { db, redis, log };
};
export const cleanup = async () => {
  await redis.disconnect();
  await db.release();
  await pool.end();
};
