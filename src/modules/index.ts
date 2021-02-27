import authorization from "./authorization";
import styles from "./styles";
import pages from "./pages";
import templates from "./templates";
import analytics from "./analytics";
import { AppModule } from "core/types";

const modules = mergeModules([
  authorization,
  styles,
  pages,
  templates,
  analytics,
]);
export default modules;

export type AppModules = typeof modules;

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
    }
  );
}
