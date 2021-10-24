#!/usr/bin/env ts-node
import path from "path";
import fs from "fs/promises";
import db from "../site/db";
import { ensureMigrationsTable, performMigration } from "../site/db/migrations";

const [_, __, command, ...args] = process.argv;

const commands = {
  create: async (mod: string, name: string) => {
    const relativeDir = path.join("../modules", mod, "migrations");
    const dirPath = path.join(__dirname, relativeDir);
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
      console.error(err);
    }
    const nameWithTimestamp = `${new Date().toISOString()}-${name}`;
    const fileName = `${nameWithTimestamp}.ts`;

    await fs.writeFile(
      path.join(dirPath, fileName),
      `import {PoolClient} from 'pg'
export default {
  name: "${nameWithTimestamp}",
  up: async (db:PoolClient)=>{},
  down: async (db:PoolClient)=>{}
}
`
    );
    const files = await fs.readdir(dirPath);
    const migrations = files.filter(
      (file) =>
        !(file === "index.ts" || file.startsWith(".") || !file.endsWith(".ts"))
    );
    await fs.writeFile(
      path.join(dirPath, "index.ts"),
      migrations
        .map(
          (name, idx) =>
            `import migration_${idx + 1} from './${name.slice(0, -3)}'`
        )
        .join("\n") +
        `\nexport default [\n${migrations
          .map((_, idx) => `migration_${idx + 1}`)
          .join(`,\n`)}\n]`
    );

    console.log(`Created  migration ${path.join(relativeDir, fileName)}`);
  },
  migrate: async (
    mod: string,
    name: string,
    operation: "up" | "down" = "up"
  ) => {
    console.log(`Running migration ${name}::${operation} in ${mod}`);
    const client = await db.connect();
    await client.query(`BEGIN;`);
    await ensureMigrationsTable(client);
    const migration = await import(`../modules/${mod}/${name}.ts`);
    await performMigration(client, migration, operation);
    await client.query(`COMMIT;`);
    await client.release();
  },
};

const fn = commands[command.trim().toLowerCase()];

if (!fn) {
  console.error(
    `Unknown command "${command}". Try these instead: ${Object.keys(commands)
      .map((k) => `"${k}"`)
      .join(", ")}`
  );
  process.exit(-1);
}

fn(...args);
