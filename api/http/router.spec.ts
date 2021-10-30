import { Test, expect } from "tiny-jest";
import { HTTPMethod } from "lib/HTTPMethod";
import { HTTPStatus } from "lib/HTTPStatus";
import createRouter from "./router";

export const test = new Test("Router");
const { it } = test;
it("should handle simple cases", async () => {
  const routeRequest = createRouter<void>({
    "/text": async () => ({
      status: 200,
      body: "Hello!",
      headers: { "Content-Type": "text" },
    }),
    "/json": async () => ({
      status: 201,
      body: { msg: "Hello!" },
      headers: { "Content-Type": "application/json" },
    }),
  });
  expect(
    await routeRequest({ path: "/text", method: HTTPMethod.GET })
  ).toMatchObject({
    status: 200,
    headers: { "Content-Type": "text" },
    body: "Hello!",
  });
  expect(
    await routeRequest({ path: "/json", method: HTTPMethod.GET })
  ).toMatchObject({
    status: 201,
    headers: { "Content-Type": "application/json" },
    body: { msg: "Hello!" },
  });
});
it("should handle method routing", async () => {
  const routeRequest = createRouter<void>({
    "/item": {
      GET: async () => ({ status: 200, body: "GET", contentType: "text" }),
      POST: async () => ({ status: 201, body: "POST", contentType: "text" }),
    },
  });
  expect(
    await routeRequest({ path: "/item", method: HTTPMethod.GET })
  ).toMatchObject({
    status: 200,
    contentType: "text",
    body: "GET",
  });
  expect(
    await routeRequest({ path: "/item", method: HTTPMethod.POST })
  ).toMatchObject({
    status: 201,
    contentType: "text",
    body: "POST",
  });
  expect(
    await routeRequest({ path: "/item", method: HTTPMethod.PUT })
  ).toMatchObject({
    status: HTTPStatus.MethodNotAllowed,
  });
});

it("should handle variables in the path", async () => {
  const routeRequest = createRouter<void>({
    "/item/:id": (_, { params: body }) => ({ status: 200, body }),
    "/:a/:b/:c": { POST: (_, { params }) => ({ status: 201, body: params }) },
  });

  expect(
    await routeRequest({ path: "/item/1", method: HTTPMethod.GET })
  ).toMatchObject({
    status: 200,
    body: { id: "1" },
  });
  expect(
    await routeRequest({ path: "/item/1/2/3", method: HTTPMethod.GET })
  ).toBe(undefined);
  expect(
    await routeRequest({ path: "/a_a/b-b/c.c", method: HTTPMethod.POST })
  ).toMatchObject({
    status: 201,
    body: { a: "a_a", b: "b-b", c: "c.c" },
  });

  const longLine = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  expect(
    await routeRequest({
      path: `/${longLine}/${longLine}/${longLine}`,
      method: HTTPMethod.POST,
    })
  ).toMatchObject({
    status: 201,
    body: { a: longLine, b: longLine, c: longLine },
  });
  expect(
    await routeRequest({
      path: `/aaa/aaaa/aaa/aaa/aaa/aaaa/aaaa/aaaaaa/aaaa/aaaa/aaa`,
      method: HTTPMethod.POST,
    })
  ).toBe(undefined);

  it("should handle body & query parameters in the path", async () => {
    const routeRequest = createRouter({
      "/test": (_, { body, queryParams }) => ({
        status: 200,
        body: { id: body.id, q: queryParams.get("q") },
      }),
    });
    expect(
      await routeRequest(
        { path: "/test", method: HTTPMethod.GET },
        {},
        {
          body: { id: 1 },
          queryParams: new URLSearchParams("q=query"),
        }
      )
    ).toMatchObject({
      status: 200,
      body: { id: 1, q: "query" },
    });
  });
});
