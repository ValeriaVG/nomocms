import { IncomingMessage, ServerResponse } from "http";
import cookie from "cookie";
import { APIContext, APIResolvers, HTTPMethod } from "../types";
import requestParams from "./requestParams";
import routeRequest from "./routeRequest";

export default function api(resolvers: APIResolvers, context: APIContext): any {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const log = context.log;
    const sendResponse = answeringFactory(res);
    try {
      res.setHeader("Content-Type", "application/json");
      const method = req.method?.toUpperCase();
      const url = new URL(req.url, "http://localhost");
      const resolver = routeRequest(url, method as HTTPMethod, resolvers);
      const params = await requestParams(req);
      context.cookies = req.headers.cookie && cookie.parse(req.headers.cookie);
      const response = await resolver(params, context);
      const code = "code" in response ? response.code : 200;
      return sendResponse(code, response);
    } catch (error) {
      const code = "code" in error ? error.code : 500;
      const message = code >= 500 ? "Internal Server Error" : error.message;
      if (code >= 500) log.error(error);
      return sendResponse(code, {
        errors: [{ name: error.name, message }],
      });
    }
  };
}

function answeringFactory(res: ServerResponse) {
  return (code: number, response: object) => {
    res.statusCode = code;
    const responseText = JSON.stringify({ ...response, code });
    res.setHeader("Content-Length", responseText.length);
    res.write(responseText);
    res.end();
  };
}
