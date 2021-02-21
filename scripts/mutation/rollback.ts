import { setupDB } from "core/context";
import { rollback } from "core/sql/mutation";
import modules from "modules";
const model = process.argv[2];
const name = process.argv[3];
if (!model || !name) {
  console.error("Please provide mutation identificator");
  console.info("yarn mutation:rollback <model> <name>");
  process.exit(-1);
}
const Source = modules.dataSources[model] as any;
if (!Source) {
  console.error(`Mutation "${model}" not found`);
  process.exit(-1);
}
const source = new Source({});
if (!("mutations" in source) || !source.mutations[name]?.down) {
  console.error(`Mutation "${name}" in "${model}" was not found`);
  process.exit(-1);
}

(async () => {
  const db = await setupDB();
  await rollback(db, { name, model, query: source.mutations[name].down }).catch(
    console.error
  );
  await db.end();
})();
