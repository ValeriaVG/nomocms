import { describe, it } from "mocha";
import { expect } from "chai";
import { routes } from "./index";
import { ResolverFn } from "core/types";
describe("pages.routes", () => {
  it("returns sitemap", async () => {
    const pages = {
      getSiteMap: () =>
        Promise.resolve([
          { id: 1, path: "/", title: "Home" },
          { id: 2, path: "/about", title: "About" },
        ]),
    };
    const sitemap = await (routes["sitemap.xml"] as ResolverFn)(
      {},
      { pages, appUrl: "https://example.com" }
    );
    expect(sitemap).to.have.property("type", "text/xml");
    expect(sitemap.data).to.eq(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/</loc></url><url><loc>https://example.com/about</loc></url></urlset>'
    );
  });
});
