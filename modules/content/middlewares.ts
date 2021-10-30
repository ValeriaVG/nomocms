import { Middleware } from "api/http/handler";
import { Ctx } from "api/http/router";
import { ServerResponse } from "http";
import compileContent from "./lib/compileContent";

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
  const content = Buffer.from(
    [
      "<!DOCTYPE html>",
      '<html lang="en">',
      "<head>",
      '<meta charset="UTF-8">',
      '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      head,
      "<style>",
      css,
      "</style>",
      "</head>",
      "<body>",
      ,
      html,
      "<script>",
      js,
      "</script>",
      "</body>",
      "</html>",
    ].join("")
  );
  res.setHeader("content-length", content.byteLength);
  res.write(content);
  res.end();
};

export default [contentMiddleware];
