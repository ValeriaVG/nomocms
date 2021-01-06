import { mergeDeepRight, reduce, unapply } from "ramda";
import * as health from "./health";
import * as authorization from "./authorization";
import * as styles from "./styles";

const mergeDeepAll = unapply(reduce(mergeDeepRight, {}));

export default mergeDeepAll(health, authorization, styles);
