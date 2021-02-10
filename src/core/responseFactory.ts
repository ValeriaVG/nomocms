import boilerplate from "amp/boilerplate";
import { appUrl } from "config";
import { IncomingMessage, ServerResponse } from "http";
import { Readable } from "stream";
import { toStream } from "utils/stream";
import NormalizedURL from "./NormalizedURL";
import { AMPResponse, RouteResponse } from "./types";

export default function responseFactory(
  req: IncomingMessage,
  res: ServerResponse
) {
  return async (response: RouteResponse) => {
    const code =
      "code" in response && typeof response.code === "number"
        ? response.code
        : 200;
    const sendError = () => {
      res.statusCode = 500;
      return res.end();
    };
    const respondWith = (response: RouteResponse) => {
      res.statusCode = code;
      if (!("data" in response && "type" in response)) {
        console.error("Incorrect response", response);
        return sendError();
      }
      res.setHeader("Content-Type", response.type);
      if (typeof response.data === "string") {
        response.length = response.data.length;
      }

      if (!("length" in response)) {
        console.error(
          "Parameter length must be provided for a stream response",
          response
        );
        return sendError();
      }

      if (["HEAD", "OPTIONS"].includes(req.method.toUpperCase()))
        return res.end();
      res.setHeader("Transfer-Encoding", "chunked");
      if (typeof response.data === "string") {
        return toStream(response.data).pipe(res);
      }
      if (!(response.data instanceof Readable)) {
        console.error("Unknown response data", response);
        return sendError();
      }
      return response.data.pipe(res);
    };

    switch (response.type) {
      case "amp": {
        const inferredUrl = req.headers.host.replace(/\/$/, "");
        const url =
          (appUrl ??
            `http${
              inferredUrl.startsWith("localhost") ? "" : "s"
            }://${inferredUrl}`) + new NormalizedURL(req.url).normalizedPath;

        const responseText = boilerplate({ url, ...(response as AMPResponse) });

        return respondWith({
          type: "text/html",
          data: responseText,
        });
      }
      case "json":
      case "application/json":
      case undefined:
      case null: {
        const responseText = JSON.stringify({ ...response, code });
        return respondWith({
          type: "application/json",
          data: responseText,
        });
      }
      case "html":
        response.type = "text/html";
      default: {
        return respondWith(response as any);
      }
    }
  };
}
