import { PoolClient } from "pg";
export default {
  name: "2021-10-24T14:03:51.501Z-init_content_source",
  up: async (db: PoolClient) => {
    await db.query(`CREATE TABLE IF NOT EXISTS content_source (
      path varchar(256) PRIMARY KEY,
      content text NOT NULL,
      published_at timestamp with time zone,
      created_at timestamp with time zone DEFAULT NOW(),
      updated_at timestamp with time zone DEFAULT NOW()
    )`);
  },
  down: async (db: PoolClient) => {
    await db.query(`DROP TABLE IF EXISTS content_source`);
  },
};
