import { Redis } from "ioredis";
import { Pool } from "pg";

export const routes = {
  "/_health": {
    GET: async (_, { redis, db }: { redis: Redis; db: Pool }) => {
      try {
        return {
          redis: await redis.ping("OK"),
          db: await db
            .query("SELECT 'OK' as status")
            .then(({ rows }) => rows[0].status),
        };
      } catch (error) {
        return {
          status: "NOT OK",
          error: error.message,
          code: 500,
        };
      }
    },
  },
};
