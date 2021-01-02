import { APIContext, APIResolvers } from "../types";
import { HTTPNotFound } from "./errors";
import requestParams from "./requestParams";
import routeRequest from "./routeRequest";

export default function api(resolvers: APIResolvers, context: APIContext): any {
  return async (req, res) => {
    const log = context.log;
    try {
      res.setHeader("Content-Type", "application/json");
      const method = req.method?.toUpperCase();
      const url = new URL(req.url, "http://localhost");
      const resolver = routeRequest(url, method, resolvers);
      const params = await requestParams(req);
      const response = await resolver(params, context);

      const sendResponse = (code: number, response: object) => {
        res.statusCode = code;
        res.write(JSON.stringify(response));
        res.end();
      };

      if (!response) {
        throw new HTTPNotFound();
      }
      const code = "code" in response ? response.code : 200;
      return sendResponse(code, response);
    } catch (error) {
      res.statusCode = "code" in error ? error.code : 500;
      let message = error.message;
      if (res.statusCode >= 500) {
        log.error(error);
        message = "Internal Server Error";
      }
      res.write(
        JSON.stringify({
          error: message,
          code: res.statusCode,
        })
      );
      res.end();
    }
  };
}
