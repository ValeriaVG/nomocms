import { PoolClient } from "pg";
export default {
  name: "1635665297908-add_page_title",
  up: async (db: PoolClient) => {
    await db.query(`ALTER TABLE content ADD COLUMN title text NOT NULL`);
  },
  down: async (db: PoolClient) => {
    await db.query(`ALTER TABLE content DROP COLUMN title text NOT NULL`);
  },
};
