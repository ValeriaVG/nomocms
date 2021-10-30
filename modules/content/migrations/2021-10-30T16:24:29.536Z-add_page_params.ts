import { PoolClient } from "pg";
export default {
  name: "2021-10-30T16:24:29.536Z-add_page_params",
  up: async (db: PoolClient) => {
    await db.query(`ALTER TABLE content ADD COLUMN parameters jsonb`);
  },
  down: async (db: PoolClient) => {
    await db.query(`ALTER TABLE content DROP COLUMN parameters jsonb`);
  },
};
