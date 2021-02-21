import { Pool } from "pg";
import { deleteFrom, insertInto, selectFrom } from "./query";
import { sql } from "./sql";
import { createTable } from "./table";

const MUTATIONS_TABLE = "db_mutations";
const TEMP_MUTATIONS_TABLE = "temp_mutations";

export const perform = async (
  db: Pool,
  mutations: Array<{ name: string; model: string; query: string }>
) => {
  console.info("💿 Checking mutations");
  const client = await db.connect();
  await client.query(
    createTable(
      MUTATIONS_TABLE,
      {
        model: { type: "varchar", length: 255 },
        name: { type: "varchar", length: 255 },
        created: { type: "timestamp", default: "NOW()" },
      },
      { ifNotExists: true, primaryKey: ["model", "name"] }
    )
  );
  try {
    await client.query("BEGIN");
    await client.query(
      sql`CREATE TEMPORARY TABLE ${TEMP_MUTATIONS_TABLE}(model VARCHAR(255),name VARCHAR(255)) ON COMMIT DROP`
    );
    await client.query(
      ...insertInto(
        TEMP_MUTATIONS_TABLE,
        mutations.map(({ name, model }) => ({ name, model }))
      )
    );
    const mutationsToRun = await client.query(
      ...selectFrom(TEMP_MUTATIONS_TABLE, {
        columns: `${TEMP_MUTATIONS_TABLE}.*`,
        join: {
          type: "LEFT",
          table: MUTATIONS_TABLE,
          on: `${TEMP_MUTATIONS_TABLE}.name =${MUTATIONS_TABLE}.name AND ${TEMP_MUTATIONS_TABLE}.model =${MUTATIONS_TABLE}.model`,
        },
        where: { [`${MUTATIONS_TABLE}.name`]: { is: "NULL" } },
      })
    );
    for (const { name, model } of mutationsToRun.rows) {
      console.info(`🔄 Running mutation: ${model}.${name}`);
      const query = mutations.find(
        (mutation) => mutation.name === name && mutation.model === model
      ).query;
      await client.query(query);
      await client.query(...insertInto(MUTATIONS_TABLE, { name, model }));
    }
    await client.query("COMMIT");
    console.info("✅ Up to date");
  } catch (e) {
    await client.query("ROLLBACK");
    console.info("🚨 Rolling mutations back");
    throw e;
  } finally {
    client.release();
  }
};
export const rollback = async (
  db: Pool,
  { name, model, query }: { name: string; model: string; query: string }
) => {
  const client = await db.connect();
  try {
    console.info(`🔄 Rolling back mutation: ${model}.${name}`);
    await client.query("BEGIN");
    const { rows } = await client.query(
      ...selectFrom(MUTATIONS_TABLE, {
        where: { name, model },
      })
    );
    if (!rows?.length)
      throw new Error(`Mutation ${model}.${name} have not been performed`);
    await client.query(query);
    await client.query(
      ...deleteFrom(MUTATIONS_TABLE, { where: { name, model } })
    );
    await client.query("COMMIT");
    console.info("✅ Done");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};
