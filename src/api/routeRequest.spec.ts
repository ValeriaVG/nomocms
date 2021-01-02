import { describe, it } from "mocha";
import { expect } from "chai";
import routeRequest from "./routeRequest";
import { HTTPMethodNotAllowed, HTTPNotFound } from "./errors";

const makeUrl = (url: string) => new URL(url, "http://localhost");

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
  it("throws proper errors if endpoint does not exist", () => {
    const resolvers = {
      item: {
        GET: () => null,
      },
    };
    expect(() =>
      routeRequest(makeUrl("/api/items"), "GET", resolvers)
    ).to.throw(HTTPNotFound);
    expect(() =>
      routeRequest(makeUrl("/api/item"), "POST", resolvers)
    ).to.throw(HTTPMethodNotAllowed);
  });
});
