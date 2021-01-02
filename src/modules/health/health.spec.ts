import { describe, it } from "mocha";
import { expect } from "chai";
import { resolvers } from "./index";

describe("health", () => {
  it("responds with ok", async () => {
    expect(await resolvers.health.GET()).to.deep.equal({ status: "OK" });
  });
});
