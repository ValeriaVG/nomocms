import { describe, it } from "mocha";
import { expect } from "chai";
import { ip2num, num2ip, requiresUser } from "./lib";
import { HTTPNotAuthorized } from "api/errors";

describe("ip", () => {
  const ip = "169.6.7.20";
  const num = 2835744532;
  it("converts ip => number", () => {
    expect(ip2num(ip)).to.eq(num);
    expect(ip2num("0.0.0.0")).to.eq(0);
    expect(ip2num("255.255.255.255")).to.eq(4294967295);
  });
  it("converts number => ip", () => {
    expect(num2ip(num)).to.eq(ip);
    expect(num2ip(0)).to.eq("0.0.0.0");
    expect(num2ip(4294967295)).to.eq("255.255.255.255");
  });
});

describe("requiresUser", () => {
  it("executes function if user has token", async () => {
    const ctx = {
      users: {
        byToken: (token) => (token === "amp-token" ? { id: "usr_1" } : null),
      },
    };
    const fn = requiresUser(() => {
      return { ok: 1 };
    });
    expect(await fn({ rid: "amp-token" }, ctx)).to.have.property("ok", 1);
    expect(ctx).to.have.property("user");
  });
  it("throws error if user has no token", async () => {
    const ctx = {
      users: {
        byToken: (token) => (token === "amp-token" ? { id: "usr_1" } : null),
      },
    };
    try {
      const fn = requiresUser(() => {
        throw "should not execute";
      });
      await fn({ rid: "amp-tokenz" }, ctx);
    } catch (error) {
      expect(error).to.be.instanceOf(HTTPNotAuthorized);
      expect(ctx).not.to.have.property("user");
    }
  });
});
