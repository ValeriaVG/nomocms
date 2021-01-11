import { dashboard } from "config";
import fs from "fs";
import path from "path";
import { IncomingMessage, ServerResponse } from "http";
import mime from "mime-types";
import NormalizedURL from "./NormalizedURL";
import { html } from "amp/lib";

// Load dashboard to memory
const files = new Map<string, { size: number; data: Buffer; type: string }>();

const loadFiles = (dir: string) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const filePath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) return loadFiles(filePath);
    const stats = fs.statSync(filePath);
    let fileUrl = filePath
      .replace(dashboard.dist, "")
      .replace(process.cwd(), ""); // TODO: fix loading static files

    files.set(fileUrl, {
      size: stats.size,
      data: fs.readFileSync(filePath),
      type: mime.lookup(filePath) || "application/octet-stream",
    });
  });
};

let template;
if (process.env.NODE_ENV !== "test") {
  console.log("Loading", dashboard.dist);
  loadFiles(dashboard.dist);
  loadFiles(path.resolve(process.cwd(), "static"));
  console.log("Loaded", files.size, "files");

  if (!files.has("/manifest-browser.json")) {
    console.error(`Could not load the dashboard. Looked in ${dashboard.dist}`);
    process.exit(1);
  }

  const { js, css } = (JSON.parse(
    files.get("/manifest-browser.json").data.toString()
  ) as {
    absPath: string;
    browserPath: string;
    relativePath: string;
    type: "js" | "css";
    webIndexed: boolean;
  }[]).reduce(
    (a, c) => {
      if (c.type === "js") a.js.push(c.browserPath);
      if (c.type === "css") a.css.push(c.browserPath);
      return a;
    },
    { js: [], css: [] } as { js: string[]; css: string[] }
  );

  const workerUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(`
  self.MonacoEnvironment = {
    baseUrl: '/admin/static/vs/'
  };
  importScripts('/admin/static/vs/base/worker/workerMain.js');`)}`;

  template = html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          type="text/javascript"
          src="/admin/static/vs/loader.js"
        ></script>
        <script>
          require.config({ paths: { vs: "/admin/static/vs" } });
        </script>
        <title>AMP CMS</title>
        ${css.map((link) => html`<link rel="stylesheet" href="${link}" />`)}
      </head>
      <body>
        ${js.map((link) => html`<script src="${link}"></script>`)}
      </body>
    </html>
  `;
}

const indexFile = {
  size: template?.length,
  data: template,
  type: "text/html",
};

export default async function renderDashboard(
  req: IncomingMessage,
  res: ServerResponse,
  next?: () => any
) {
  const url = new NormalizedURL(req.url);
  const filePath = url.pathname.replace(dashboard.pathname, "");

  let file = files.has(filePath) ? files.get(filePath) : indexFile;
  res.setHeader("Content-Type", file.type);
  res.setHeader("Content-Length", file.size);
  if (["HEAD", "OPTIONS"].includes(req.method.toUpperCase())) return res.end();
  res.write(file.data);
  res.end();
  if (next) next();
}
