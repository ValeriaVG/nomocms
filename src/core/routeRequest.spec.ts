import { describe, it } from "mocha";
import { expect } from "chai";
import routeRequest from "./routeRequest";
import { HTTPMethodNotAllowed } from "./errors";
import NormalizedURL from "./NormalizedURL";
import createRouter, { createRoutes } from "utils/router";

const makeUrl = (url: string) => new NormalizedURL(url);

describe("routeRequest", () => {
  it("routes existing requests", () => {
    const GET = () => {};
    const DELETE = () => {};
    const POST = () => {};
    const PATCH = () => {};
    const getItems = () => {};

    const routes = createRoutes({
      "/api/item": {
        POST,
        GET,
        PATCH,
        DELETE,
      },
      "/api/items": {
        GET: getItems,
      },
    });

    expect(
      routeRequest(makeUrl("/api/item?id=1"), "GET", routes)
    ).to.have.property("resolver", GET);

    expect(routeRequest(makeUrl("/api/item"), "POST", routes)).to.have.property(
      "resolver",
      POST
    );

    expect(
      routeRequest(makeUrl("/api/item?id=1"), "DELETE", routes)
    ).to.have.property("resolver", DELETE);

    expect(
      routeRequest(makeUrl("/api/item?id=1"), "PATCH", routes)
    ).to.have.property("resolver", PATCH);

    expect(
      routeRequest(makeUrl("/api/items?limit=3"), "GET", routes)
    ).to.have.property("resolver", getItems);
  });
  it("handles cases when endpoint or method does not exist", () => {
    const routes = createRoutes({
      "/api/item": {
        GET: () => ({}),
      },
    });
    expect(routeRequest(makeUrl("/api/items"), "GET", routes)).to.have.property(
      "resolver",
      null
    );
    expect(() => routeRequest(makeUrl("/api/item"), "POST", routes)).to.throw(
      HTTPMethodNotAllowed
    );
  });

  it("can resolve route with parameters", () => {
    const routes = createRoutes({
      "/item/:id": ({ id }) => ({ item: id }),
    });
    const { resolver, params } = routeRequest(
      makeUrl("/item/itm_1"),
      "GET",
      routes
    );
    expect(params).to.deep.eq({ id: "itm_1" });
    expect(resolver(params, null)).to.deep.eq({ item: "itm_1" });
  });
  it("can create functional router", () => {
    const state = {
      path: "/",
      params: {},
    };
    const route = createRouter({
      "/": () => {
        state.path = "home";
      },
      "/info": () => {
        state.path = "info";
      },
      "/user/:id": (params) => {
        state.path = "user";
        state.params = params;
      },
    });
    route("/");
    expect(state).to.have.property("path", "home");
    route("/info");
    expect(state).to.have.property("path", "info");
    const rnd = Math.random();
    route(`/user/${rnd}`);
    expect(state).to.have.property("path", "user");
    expect(state.params).to.have.property("id", rnd.toString());
  });
});
