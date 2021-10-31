import path from "path";
import http from "http";
import { readFile, mkdir, writeFile } from "fs/promises";
import { serve } from "esbuild";
import * as config from "./config";

export const getHTML = async (props: { version?: string } = {}) => {
  const template = await readFile(config.indexHTML);
  return template.toString().replace("<version>", props.version || "");
};

const startDevServer = async () => {
  const devServer = await serve(
    {
      port: 9000,
    },
    {
      ...config.esbuild,
      write: false,
    }
  );
  return devServer;
};
if (!module.parent) {
  startDevServer().then((devServer) => {
    const proxyServer = http.createServer((req, res) => {
      const base = "http://localhost:9000";
      const url = new URL(req.url, base);
      const proxyReq = http.request(
        {
          hostname: "localhost",
          port: 9000,
          method: req.method,
          headers: req.headers,
          path: url.pathname,
        },
        async (proxyRes) => {
          if (proxyRes.statusCode === 404 || url.pathname === "/") {
            const html = await getHTML({ version: "dev" });
            res.writeHead(200, {
              "Content-Type": "text/html",
              "Content-Length": Buffer.from(html).byteLength,
            });
            res.write(html);
            res.end();
          } else {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
          }
        }
      );
      req.pipe(proxyReq, { end: true });
    });

    const listener = proxyServer.listen(3000, () => {
      console.log(`Dev server is listening on http://localhost:3000`);
    });

    let isStopping = false;
    const stop = () => {
      if (isStopping) return;
      isStopping = true;
      listener.close();
      devServer.stop();
      process.exit(0);
    };

    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
    process.on("SIGABRT", stop);
  });
}
