import { Server } from "http";
import ampCORS from "amp-toolbox-cors";
import modules from "./modules";
import API from "./api";
import AMP from "./amp";

const port = 8080;

const server = new Server((req, res) => {
  ampCORS()(req, res, () => {
    const api = API(modules.resolvers, { log: console });
    if (req.url?.startsWith("/api")) return api(req, res);
    const amp = AMP();
    return amp(req, res);
  });
});

server.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
