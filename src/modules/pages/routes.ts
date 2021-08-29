import NormalizedURL from "core/NormalizedURL";
import Pages from "./Pages";
import adminRoutes from "./adminRoutes";

export default {
  ...adminRoutes,
  "/sitemap.xml": async (
    _,
    {
      pages,
      appUrl,
    }: {
      appUrl: string;
      pages: Pages;
    }
  ) => {
    {
      const sitemap = await pages.getSiteMap();
      const entries = sitemap
        .map(
          (entry) => "<url>" + `<loc>${appUrl}${entry.path}</loc>` + "</url>"
        )
        .join("");

      return {
        type: "text/xml",
        data:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
          entries +
          "</urlset>",
      };
    }
  },
  "/*": async (_, { pages, url }: { pages: Pages; url: NormalizedURL }) => {
    const page = await pages.retrieve(url.normalizedPath);
    if (page) return { type: "amp", ...page };
    const notFoundPage = await pages.retrieve("/*");
    return { type: "amp", ...notFoundPage, code: 404 };
  },
};
