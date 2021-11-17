import { PoolClient } from "pg";
export default {
  name: "1635611069536-add_page_params",
  up: async (db: PoolClient) => {
    await db.query(`ALTER TABLE content ADD COLUMN parameters jsonb`);
  },
  down: async (db: PoolClient) => {
    await db.query(`ALTER TABLE content DROP COLUMN parameters jsonb`);
  },
};
