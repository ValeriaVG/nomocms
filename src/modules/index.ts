import { mergeDeepRight } from "ramda";
import * as health from "./health";
import * as authorization from "./authorization";
export default mergeDeepRight(health, authorization);
