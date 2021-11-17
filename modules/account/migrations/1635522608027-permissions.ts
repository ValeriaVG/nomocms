import { PoolClient } from "pg";
export default {
  name: "1635522608027-permissions",
  up: async (db: PoolClient) => {
    await db.query(`CREATE TABLE IF NOT EXISTS account_permissions (
      account_id uuid NOT NULL,
      scope text,
      permissions integer NOT NULL,
      PRIMARY KEY(account_id,scope),
      CONSTRAINT fk_account
        FOREIGN KEY(account_id) 
      REFERENCES accounts(id) ON DELETE CASCADE
    )`);
  },
  down: async (db: PoolClient) => {
    await db.query(`DROP TABLE IF EXISTS account_permissions`);
  },
};
