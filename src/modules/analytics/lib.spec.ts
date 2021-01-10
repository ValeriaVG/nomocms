import { describe, it } from "mocha";
import { expect } from "chai";
import { ip2num, num2ip } from "./lib";

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
