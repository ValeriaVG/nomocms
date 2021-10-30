import { Middleware } from "api/http/handler";
import { Ctx } from "api/http/router";
import { ServerResponse } from "http";
import compileContent from "./lib/compileContent";
import toHTMLBuffer from "./lib/toHTMLBuffer";

const contentMiddleware: Middleware = async (
  { req, db }: Ctx,
  res: ServerResponse,
  next: () => Promise<void>
) => {
  await next();
  if (res.writableEnded) return;
  const url = new URL(req.url, "http://localhost");
  const result = await db.query(
    `SELECT * FROM content WHERE path=$1 AND published_at<= NOW() LIMIT 1`,
    [url.pathname]
  );
  const isFound = result.rowCount > 0;
  res.statusCode = isFound ? 200 : 404;
  if (req.method === "OPTIONS") return res.end();
  const page = isFound
    ? result.rows[0]
    : {
        content: `<script>import Page404 from '$content/Page404.svelte'</script><Page404/>`,
      };

  const { head, html, css, js } = await compileContent(
    page.content,
    page.parameters
  );

  res.setHeader("content-type", "text/html");
  const content = toHTMLBuffer({ head, html, css, js });
  res.setHeader("content-length", content.byteLength);
  res.write(content);
  res.end();
};

export default [contentMiddleware];
