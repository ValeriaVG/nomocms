import { describe, it } from "mocha";
import { expect } from "chai";
import ensureType from "./ensureType";
import { Integer, Optional, Required, Text } from "./transformers";

describe("ensureType", () => {
  it("works for simple objects", () => {
    const parsed = ensureType(
      { int: "1", str: "1" },
      { int: Integer, str: Text }
    );
    expect(parsed).to.deep.equal({ int: 1, str: "1" });
  });
  it("works for required params", () => {
    const t = { int: Required(Integer), str: Required(Text) };
    expect(() => ensureType({ int: null, str: "" }, t)).to.throw(
      'Property "int" is required'
    );
    expect(() => ensureType({ int: undefined, str: "" }, t)).to.throw(
      'Property "int" is required'
    );
    expect(() => ensureType({ int: 0, str: "" }, t)).not.to.throw();
    expect(() => ensureType({ int: 1, str: null }, t)).to.throw(
      'Property "str" is required'
    );
    expect(() => ensureType({ int: 1, str: {} }, t)).to.throw(
      'Property "str" must be a string'
    );
  });
  it("works for optional params", () => {
    const t = { str: Optional(Text) };
    expect(ensureType({ str: null }, t)).to.have.property("str", null);
    expect(ensureType({ str: undefined }, t)).to.have.property("str", null);
    expect(ensureType({ str: "" }, t)).to.have.property("str", "");
    expect(() => ensureType({ str: 0 }, t)).to.throw(
      'Property "str" must be a string'
    );
  });
});
