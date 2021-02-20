import { Server } from "http";
import modules from "./modules";
import core from "./core";
import { setup, cleanup } from "./core/context";

export default async function createServer() {
  const middleware = await core(modules, await setup());
  const server = new Server(middleware);
  server.on("close", cleanup);
  return server;
}
