import { describe, it } from "mocha";
import { expect } from "chai";
import { html, attr } from "./lib";

describe("html", () => {
  it("prevents conditional undefined", () => {
    expect(html`<div>${"defined" && "yes"}${undefined && "no"}</div>`).to.be.eq(
      "<div>yes</div>"
    );
  });
  it("prevents conditional number", () => {
    expect(html`<div>${1 && "one"}${0 && "zero"}</div>`).to.be.eq(
      "<div>one</div>"
    );
  });
});

describe("attr", () => {
  it("escapes quotes in an attribute", () => {
    expect(attr`some "value"`).to.eq('"some &quot;value&quot;"');
  });
});
