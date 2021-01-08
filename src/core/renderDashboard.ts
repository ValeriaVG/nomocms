import { dashboard } from "config";
import fs, { existsSync } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import mime from "mime-types";

export default async function renderDashboard(
  req: IncomingMessage,
  res: ServerResponse,
  next?: () => any
) {
  let filePath = req.url.replace(dashboard.path, dashboard.dist + "/");

  if (!existsSync(filePath)) {
    filePath = dashboard.dist + "/index.html";
  }
  let file = fs.statSync(filePath);
  if (!file.isFile()) {
    filePath = dashboard.dist + "/index.html";
    file = fs.statSync(filePath);
  }
  const type = mime.lookup(filePath) || "application/octet-stream";
  res.setHeader("Content-Type", type);
  res.setHeader("Content-Length", file.size);
  fs.createReadStream(filePath).pipe(res);
  if (next) next();
}
