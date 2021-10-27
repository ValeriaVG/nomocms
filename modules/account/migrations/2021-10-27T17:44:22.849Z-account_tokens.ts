import { PoolClient } from "pg";
export default {
  name: "2021-10-27T17:44:22.849Z-account_tokens",
  up: async (db: PoolClient) => {
    await db.query(`CREATE TABLE IF NOT EXISTS account_tokens (
      token uuid PRIMARY KEY,
      account_id uuid,
      is_superuser boolean default false,
      created_at timestamp with time zone,
      expires_at timestamp with time zone,
      CONSTRAINT fk_account
        FOREIGN KEY(account_id) 
      REFERENCES accounts(id)
    )`);
  },
  down: async (db: PoolClient) => {
    await db.query(`DROP TABLE IF EXISTS account_tokens`);
  },
};
