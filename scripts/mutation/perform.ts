import { initDataSources } from "core";
import { setupDB } from "core/context";
import modules from "modules";
(async () => {
  const db = await setupDB();
  await initDataSources({ db } as any, modules.dataSources).catch(
    console.error
  );
  await db.end();
})();
