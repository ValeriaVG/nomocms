import { mergeDeepRight, reduce, unapply } from "ramda";
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
);
