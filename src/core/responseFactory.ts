import boilerplate from "amp/boilerplate";
import { appUrl } from "config";
import { IncomingMessage, ServerResponse } from "http";
import { Readable } from "stream";
import { toStream } from "utils/stream";
import NormalizedURL from "./NormalizedURL";
import { AMPResponse, RouteResponse } from "./types";

const sendError = (res: ServerResponse) => {
  res.statusCode = 500;
  return res.end();
};

const getCanonicalUrl = (req: IncomingMessage) => {
  const inferredUrl = req.headers.host.replace(/\/$/, "");
  return (
    (appUrl ??
      `http${
        inferredUrl.startsWith("localhost") ? "" : "s"
      }://${inferredUrl}`) + new NormalizedURL(req.url).normalizedPath
  );
};

const createResponder = (req: IncomingMessage, res: ServerResponse) => (
  response: RouteResponse
) => {
  if (!("data" in response && "type" in response)) {
    console.error("Incorrect response", response);
    return sendError(res);
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
    return sendError(res);
  }

  if (["HEAD", "OPTIONS"].includes(req.method.toUpperCase())) return res.end();
  res.setHeader("Transfer-Encoding", "chunked");
  if (typeof response.data === "string") {
    return toStream(response.data).pipe(res);
  }
  if (!(response.data instanceof Readable)) {
    console.error("Unknown response data", response);
    return sendError(res);
  }
  return response.data.pipe(res);
};

export default function responseFactory(
  req: IncomingMessage,
  res: ServerResponse
) {
  const respondWith = createResponder(req, res);
  return async (response: RouteResponse) => {
    res.statusCode = typeof response.code === "number" ? response.code : 200;
    switch (response.type) {
      case "amp": {
        return respondWith({
          type: "text/html",
          data: boilerplate({
            url: getCanonicalUrl(req),
            ...(response as AMPResponse),
          }),
        });
      }
      case "json":
      case "application/json":
      case undefined:
      case null: {
        return respondWith({
          type: "application/json",
          data: JSON.stringify({ ...response, code: res.statusCode }),
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
