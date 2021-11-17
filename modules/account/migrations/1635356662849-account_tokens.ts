import { PoolClient } from "pg";
export default {
  name: "1635356662849-account_tokens",
  up: async (db: PoolClient) => {
    await db.query(`CREATE TABLE IF NOT EXISTS account_tokens (
      token uuid PRIMARY KEY,
      account_id uuid,
      is_superuser boolean default false,
      created_at timestamp with time zone DEFAULT NOW(),
      expires_at timestamp with time zone,
      CONSTRAINT fk_account
        FOREIGN KEY(account_id) 
      REFERENCES accounts(id) ON DELETE CASCADE
    )`);
  },
  down: async (db: PoolClient) => {
    await db.query(`DROP TABLE IF EXISTS account_tokens`);
  },
};
