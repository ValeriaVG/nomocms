import { PoolClient } from "pg";

type MigrationMode = "up" | "down";

export type Migration = { name: string } & Record<
  MigrationMode,
  (db: PoolClient) => Promise<void>
>;

const MIGRATIONS_TABLE = "_migrations_";

export async function ensureMigrationsTable(client: PoolClient) {
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (name varchar(256) PRIMARY KEY, performed_at timestamp with time zone);`
  );
}

export async function performMigration(
  client: PoolClient,
  migration: Migration,
  mode: MigrationMode
): Promise<boolean> {
  const {
    rows: [needs],
  } = await client.query(
    `SELECT COUNT(*)=0 as migration FROM ${MIGRATIONS_TABLE} WHERE name=$1`,
    [migration.name]
  );
  if (needs.migration) {
    console.info(`Migrating ${mode}`, migration.name);
    await migration[mode](client);
    await client.query(`INSERT INTO ${MIGRATIONS_TABLE} VALUES($1,NOW())`, [
      migration.name,
    ]);
  }
  return needs.migration;
}
