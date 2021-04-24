import authorization from "./authorization";
import styles from "./styles";
import pages from "./pages";
import templates from "./templates";
import analytics from "./analytics";
import date from "./date";
import health from "./health";
import scripts from "./scripts";
import { AppModule } from "core/types";

const modules = mergeModules([
  health,
  authorization,
  styles,
  templates,
  date,
  analytics,
  scripts,
  // Keep pages last
  pages,
]);
export default modules;

export type AppModules = ReturnType<typeof mergeModules>;

function mergeModules<T extends readonly AppModule[]>(modules: T) {
  return modules.reduce(
    (a, c) => {
      for (const key in a) {
        if (c[key]) {
          Array.isArray(a[key])
            ? a[key].push(c[key])
            : Object.assign(a[key], c[key]);
        }
      }
      return a;
    },
    {
      dataSources: {},
      resolvers: [],
      typeDefs: [],
      directiveResolvers: [],
      routes: {},
    }
  );
}
