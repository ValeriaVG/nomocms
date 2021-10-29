import { PoolClient } from "pg";
export default {
  name: "2021-10-29T15:50:08.027Z-permissions",
  up: async (db: PoolClient) => {
    await db.query(`CREATE TABLE IF NOT EXISTS account_permissions (
      account_id uuid NOT NULL,
      scope varchar(256),
      permissions integer NOT NULL,
      PRIMARY KEY(account_id,scope),
      CONSTRAINT fk_account
        FOREIGN KEY(account_id) 
      REFERENCES accounts(id) 
    )`);
  },
  down: async (db: PoolClient) => {
    await db.query(`DROP TABLE IF EXISTS account_permissions`);
  },
};
