import { Server } from "http";
import ampCORS from "amp-toolbox-cors";

import modules from "./modules";
import core from "./core";
import * as context from "./core/context";

export default () =>
  core(modules, context).then((middleware) => {
    return new Server((req, res) => {
      return ampCORS()(req, res, () => middleware(req, res));
    });
  });
