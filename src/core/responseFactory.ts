import boilerplate from "amp/boilerplate";
import { appUrl } from "config";
import { IncomingMessage, ServerResponse } from "http";
import { Readable } from "stream";
import { AMPResponse, RouteResponse } from "./types";

export default function responseFactory(
  req: IncomingMessage,
  res: ServerResponse
) {
  return async (response: RouteResponse) => {
    const code = "code" in response ? response.code : 200;
    res.statusCode = code;
    switch (response.type) {
      case "amp": {
        res.setHeader("Content-Type", "text/html");
        const inferredUrl = req.headers.host.replace(/\/$/, "");
        const url =
          appUrl ??
          `http${
            inferredUrl.startsWith("localhost") ? "" : "s"
          }://${inferredUrl}`;
        const responseText = boilerplate({ url, ...(response as AMPResponse) });
        res.setHeader("Content-Length", responseText.length);
        res.write(responseText);
        return res.end();
      }
      case "json":
      case "application/json":
      case undefined:
      case null: {
        res.setHeader("Content-Type", "application/json");
        const responseText = JSON.stringify({ ...response, code });
        res.setHeader("Content-Length", responseText.length);
        res.write(responseText);
        return res.end();
      }
      case "html":
        response.type = "text/html";
      default: {
        if (!("data" in response && "type" in response)) {
          throw Error("Incorrect response");
        }
        res.setHeader("Content-Type", response.type);
        if (typeof response.data === "string") {
          res.setHeader("Content-Length", response.data.length.toString());
          res.write(response.data);
          return res.end();
        }
        if (!(response.data instanceof Readable))
          throw new Error("Unknown response data");
        if (!("length" in response))
          throw new Error(
            "Parameter length must be provided for a stream response"
          );
        res.setHeader("Content-Length", response.length.toString());
        return response.data.pipe(res);
      }
    }
  };
}
