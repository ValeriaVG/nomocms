import { describe, it, afterEach } from "mocha";
import { expect } from "chai";
import createHotKey from "./hotkey";

describe("HotKey", () => {
  let unmount = () => {};
  afterEach(unmount);
  it("triggers event only on hot key", async () => {
    const state = {
      called: 0,
    };
    unmount = createHotKey(
      [
        { key: "s", ctrlKey: true },
        { key: "s", metaKey: true },
      ],
      () => state.called++
    );
    const justS = new window.KeyboardEvent("keydown", {
      key: "s",
    });
    document.body.dispatchEvent(justS);
    expect(state).to.have.property("called", 0);

    const shiftS = new window.KeyboardEvent("keydown", {
      key: "s",
      shiftKey: true,
    });
    document.body.dispatchEvent(shiftS);
    expect(state).to.have.property("called", 0);

    const ctrlR = new window.KeyboardEvent("keydown", {
      key: "r",
      ctrlKey: true,
    });
    document.body.dispatchEvent(ctrlR);
    expect(state).to.have.property("called", 0);

    const ctrlS = new window.KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
    });
    document.body.dispatchEvent(ctrlS);
    expect(state).to.have.property("called", 1);

    const cmdS = new window.KeyboardEvent("keydown", {
      key: "s",
      metaKey: true,
    });
    document.body.dispatchEvent(cmdS);
    expect(state).to.have.property("called", 2);
  });
});
