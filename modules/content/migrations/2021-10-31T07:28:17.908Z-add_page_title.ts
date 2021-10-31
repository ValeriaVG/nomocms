import { PoolClient } from "pg";
export default {
  name: "2021-10-31T07:28:17.908Z-add_page_title",
  up: async (db: PoolClient) => {
    await db.query(`ALTER TABLE content ADD COLUMN title text NOT NULL`);
  },
  down: async (db: PoolClient) => {
    await db.query(`ALTER TABLE content DROP COLUMN title text NOT NULL`);
  },
};
