import { Server } from "http";

import modules from "./modules";
import core from "./core";
import * as context from "./core/context";

const port = 8080;

(async () => {
  const middleware = await core(modules, context);
  const server = new Server(middleware);
  server.listen(port, () => {
    console.log(`http://localhost:${port}/`);
  });
})();
