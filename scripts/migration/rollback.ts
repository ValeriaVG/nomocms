import { setupDB } from "core/context";
import { rollback } from "core/sql/migration";
import modules from "modules";
const model = process.argv[2];
const name = process.argv[3];
if (!model || !name) {
  console.error("Please provide migration identificator");
  console.info("yarn rollback <model> <name>");
  process.exit(-1);
}
const Source = modules.dataSources[model] as any;
if (!Source) {
  console.error(`Migration "${model}" not found`);
  process.exit(-1);
}
const source = new Source({});
if (!("migrations" in source) || !source.migrations[name]?.down) {
  console.error(`Migration "${name}" in "${model}" was not found`);
  process.exit(-1);
}

(async () => {
  const db = await setupDB();
  await rollback(db, {
    name,
    model,
    query: source.migrations[name].down,
  }).catch(console.error);
  await db.end();
})();
