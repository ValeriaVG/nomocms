import { describe, it } from "mocha";
import { expect } from "chai";
import { deferred, sleep } from "./functions";

describe("deferred", () => {
  it("limits function execution to once in a time frame", async () => {
    const state = { num: 0 };
    const deferredFunction = deferred(() => {
      state.num++;
    }, 100);
    deferredFunction();
    deferredFunction();
    deferredFunction();
    deferredFunction();
    await sleep(100);
    expect(state).to.have.property("num", 1);
  });
  it("allows forced immediate execution", async () => {
    const state = { num: 0 };
    const deferredFunction = deferred(() => {
      state.num++;
    }, 100);
    deferredFunction(true);
    deferredFunction(true);
    deferredFunction(true);
    deferredFunction(true);
    await sleep(100);
    expect(state).to.have.property("num", 4);
  });
});
