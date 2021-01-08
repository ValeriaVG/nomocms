import { describe, it } from "mocha";
import { expect } from "chai";
import NormalizedURL from "./NormalizedURL";

describe("NormalizedURL", () => {
  it("does not change URLs with trailing slash", () => {
    const url = new NormalizedURL("/");
    expect(url.pathname).to.eq("/");
    expect(url.normalizedPath).to.eq("/");
    expect(url.paths).to.deep.eq(["/"]);
  });
  it("does not change file urls", () => {
    const url = new NormalizedURL("/index.html");
    expect(url.pathname).to.eq("/index.html");
    expect(url.normalizedPath).to.eq("/index.html");
    expect(url.paths).to.deep.eq(["/index.html"]);
  });
  it("adds trailing slash to urls without it", () => {
    const url = new NormalizedURL("/admin");
    expect(url.pathname).to.eq("/admin");
    expect(url.normalizedPath).to.eq("/admin/");
    expect(url.paths).to.deep.eq(["/admin/", "/admin"]);
  });
});
