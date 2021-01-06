import { describe, it } from "mocha";
import { expect } from "chai";
import {
  DataType,
  NUL,
  TBoolean,
  TFloat,
  TInt,
  TJSON,
  TString,
} from "./datatypes";

describe("data types", () => {
  it("can compose a scheme", () => {
    const schema = {
      title: TString,
      published: TBoolean,
    };
  });

  const checkNull = (Type: any) => {
    const nothing = new Type(null);
    expect(nothing.toString()).to.be.eq(NUL);
    expect(Type.from(NUL)).to.have.property("value", null);
    expect(Type.from("undefined")).to.have.property("value", null);
  };

  it("boolean", () => {
    const yes = new TBoolean(true);
    expect(yes.toString()).to.be.eq("1");
    expect(TBoolean.from("true")).to.have.property(
      "value",
      true,
      "String true"
    );
    expect(TBoolean.from("1")).to.have.property("value", true);
    expect(TBoolean.from("9000")).to.have.property("value", true);
    checkNull(TBoolean);
  });
  it("integer", () => {
    const num = new TInt(123);
    expect(num.toString()).to.be.eq("123");
    expect(new TInt(123.4).toString()).to.be.eq("123");
    expect(TInt.from("-0")).to.have.property("value", 0);
    expect(TInt.from("0")).to.have.property("value", 0);
    checkNull(TInt);
  });
  it("float", () => {
    const num = new TFloat(0.123);
    expect(num.toString()).to.be.eq("0.123");
    expect(TFloat.from("-1.23")).to.have.property("value", -1.23);
    expect(TFloat.from("1.234")).to.have.property("value", 1.234);
    checkNull(TFloat);
  });
  it("string", () => {
    const str = new TString("Hello, World");
    expect(str.toString()).to.be.eq("Hello, World");
    checkNull(TString);
  });
  it("json", () => {
    const obj = new TJSON({ foo: "bar" });
    expect(obj.toString()).to.be.eq('{"foo":"bar"}');
    checkNull(TJSON);
  });
});
