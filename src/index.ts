import { Server } from "http";
import modules from "./modules";

import API from "./api";

const port = 8080;

const server = new Server((req, res) => {
  const api = API(modules.resolvers, { log: console });
  if (req.url?.startsWith("/api")) return api(req, res);
  res.statusCode = 404;
  res.write("Not Found");
  res.end();
});

server.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
