import { Pool } from "pg";

export default {
  "/_health": async (_, { db }: { db: Pool }) => {
    try {
      return {
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
};
