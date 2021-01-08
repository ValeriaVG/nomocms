import { Server } from "http";
import ampCORS from "amp-toolbox-cors";

import modules from "./modules";
import core from "./core";
import * as context from "./core/context";

const middleware = core(modules, context);
const server = new Server((req, res) => {
  return ampCORS()(req, res, () => middleware(req, res));
});
export default server;
