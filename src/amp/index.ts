import { IncomingMessage, ServerResponse } from "http";
import boilerplate from "./boilerplate";
import * as login from "./login";
export default function amp() {
  return async (req: IncomingMessage, res: ServerResponse) => {
    res.statusCode = 200;
    const page = boilerplate(login);
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Length", page.length);
    res.write(page);
    res.end();
  };
}
