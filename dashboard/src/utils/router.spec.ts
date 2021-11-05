import { Test, expect } from "tiny-jest";
import createRouter from "./router";
export const test = new Test("Web Router");

const { it } = test;
const routePath = createRouter<string>({
  "/": "index",
  "/a/b": "ab",
  "/:a/:b/:c": "abc",
});

it("can route simple requests", () => {
  expect(routePath("/")).toMatchObject(["index", {}]);
  expect(routePath("/a/b")).toMatchObject(["ab", {}]);
});
it("can route requests with variables", () => {
  expect(routePath("/a/b/c")).toMatchObject([
    "abc",
    { a: "a", b: "b", c: "c" },
  ]);
});
it("returns undefined for unknown requests", () => {
  expect(routePath("/a/b/c/d")).toBe(undefined);
});
