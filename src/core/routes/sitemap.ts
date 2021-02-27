import Pages from "modules/pages/Pages";
export default async function handleSitemap({
  pages,
  appUrl,
}: {
  appUrl: string;
  pages: Pages;
}) {
  {
    const sitemap = await pages.getSiteMap();
    const entries = sitemap
      .map((entry) => "<url>" + `<loc>${appUrl}${entry.path}</loc>` + "</url>")
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
}
