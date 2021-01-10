import { describe, it } from "mocha";
import { expect } from "chai";
import { requiresUser } from "./lib";
import { HTTPNotAuthorized } from "core/errors";

describe("requiresUser", () => {
  it("executes function if user exists", async () => {
    const ctx = {
      user: { id: "usr_1" },
    };
    const fn = requiresUser(() => {
      return { ok: 1 };
    });
    expect(await fn(null, ctx)).to.have.property("ok", 1);
  });
  it("throws error if no users are authorized", async () => {
    const ctx = {};
    try {
      const fn = requiresUser(() => {
        throw "should not execute";
      });
      await fn(null, ctx);
    } catch (error) {
      expect(error).to.be.instanceOf(HTTPNotAuthorized);
      expect(ctx).not.to.have.property("user");
    }
  });
});
