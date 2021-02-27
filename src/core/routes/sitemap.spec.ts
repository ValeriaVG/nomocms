import { test } from "mocha";
import { expect } from "chai";
import handleSitemap from "./sitemap";

test("handleSitemap", async () => {
  const pages = {
    getSiteMap: () =>
      Promise.resolve([
        { id: 1, path: "/", title: "Home" },
        { id: 2, path: "/about", title: "About" },
      ]),
  } as any;
  const sitemap = await handleSitemap({ pages, appUrl: "https://example.com" });
  expect(sitemap).to.have.property("type", "text/xml");
  expect(sitemap.data).to.eq(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/</loc></url><url><loc>https://example.com/about</loc></url></urlset>'
  );
});
