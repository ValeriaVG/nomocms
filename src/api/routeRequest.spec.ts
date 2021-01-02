import { describe, it } from "mocha";
import { expect } from "chai";
import routeRequest from "./routeRequest";

describe("routeRequest", () => {
  it("routes existing requests", () => {
    const GET = () => {};
    const DELETE = () => {};
    const POST = () => {};
    const PATCH = () => {};
    const getItems = () => {};

    const resolvers = {
      item: {
        POST,
        GET,
        PATCH,
        DELETE,
      },
      items: {
        GET: getItems,
      },
    };
    const makeUrl = (url: string) => new URL(url, "http://localhost");

    expect(routeRequest(makeUrl("/api/item?id=1"), "GET", resolvers)).to.equal(
      GET
    );

    expect(routeRequest(makeUrl("/api/item"), "POST", resolvers)).to.equal(
      POST
    );

    expect(
      routeRequest(makeUrl("/api/item?id=1"), "DELETE", resolvers)
    ).to.equal(DELETE);

    expect(
      routeRequest(makeUrl("/api/item?id=1"), "PATCH", resolvers)
    ).to.equal(PATCH);

    expect(
      routeRequest(makeUrl("/api/items?limit=3"), "GET", resolvers)
    ).to.equal(getItems);
  });
});
