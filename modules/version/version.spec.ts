import { Test, expect } from "tiny-jest";
import versionModule from "./.";

export const test = new Test("Version Module");

const { it } = test;

it("reports current version", async () => {
  const result = await versionModule.routes["/version"]();
  expect(result.body.version).toBeTruthy();
  const ver = result.body.version.split(".").map((v) => Number(v));
  expect(ver.length).toBe(3);
});
