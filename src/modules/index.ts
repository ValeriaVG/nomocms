import { mergeDeepRight, reduce, unapply } from "ramda";
import { Routes } from "core/types";
import { DataSource } from "core/DataSource";

import * as health from "./health";
import * as authorization from "./authorization";
import * as styles from "./styles";
import * as pages from "./pages";
import * as templates from "./templates";
import * as analytics from "./analytics";

const mergeDeepAll = unapply(reduce(mergeDeepRight, {}));

export default mergeDeepAll(
  health,
  authorization,
  styles,
  pages,
  templates,
  analytics
) as { routes: Routes; dataSources: Record<string, typeof DataSource> };
