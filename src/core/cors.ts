import { IncomingMessage, ServerResponse } from "http";

export default function cors(req: IncomingMessage, res: ServerResponse) {
  const sourceOrigin = req.headers.origin;
  // TODO: AMP cache list
  res.setHeader("Access-Control-Allow-Origin", sourceOrigin ?? "*");
  res.setHeader(
    "Access-Control-Expose-Headers",
    ["AMP-Redirect-To", "AMP-Access-Control-Allow-Source-Origin"].join(",")
  );
  res.setHeader("Access-Control-Allow-Headers", ["Content-Type"].join(","));
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST,GET,PUT,DELETE,HEAD,OPTIONS"
  );
}
