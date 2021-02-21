/* istanbul ignore file */
import { Pool } from "pg";
import { db as databaseConfig } from "../config";

const context: Partial<{ db: Pool }> = {};

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

export const setup = async () => {
  const db = await setupDB();
  context.db = db;

  return { db, log: console };
};
export const cleanup = async () => {
  await context?.db.end();
};
