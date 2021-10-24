import { PoolClient } from "pg";
export default {
  name: "2021-10-24T13:52:01.538Z-init_accounts",
  up: async (db: PoolClient) => {
    await db.query(`CREATE TABLE IF NOT EXISTS accounts (
      id uuid PRIMARY KEY,
      email varchar(256) UNIQUE NOT NULL,
      pwhash text NOT NULL,
      created_at timestamp with time zone DEFAULT NOW(),
      updated_at timestamp with time zone DEFAULT NOW()
    )`);
  },
  down: async (db: PoolClient) => {
    await db.query(`DROP TABLE IF EXISTS accounts`);
  },
};
