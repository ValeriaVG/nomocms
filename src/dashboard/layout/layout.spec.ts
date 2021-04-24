import { describe, it } from "mocha";
import { expect } from "chai";
import layout from "./.";

describe("layout", () => {
  beforeEach(() => {
    layout(document.body, true);
  });
  afterEach(() => {
    document.body.innerHTML = "";
  });
  it("renders", () => {
    expect(document.body.querySelector("main")).not.to.be.null;
  });
  describe("resizeable panels", () => {
    it("has 2 splitters", () => {
      const splitters = document.querySelectorAll(".splitter");
      expect(splitters).to.have.length(2);
    });
    it("can resize a panel", () => {
      const grid: HTMLElement = document.querySelector(".wrapper");
      const leftSplitter = document.querySelectorAll(".splitter")[0];
      const mousemove = new Event("mousemove");
      mousemove["clientX"] = 100;
      expect(grid.style).to.have.property(
        "grid-template-columns",
        "12rem 1fr 24rem"
      );
      leftSplitter.dispatchEvent(new Event("mousedown"));
      mousemove["clientX"] = 150;
      window.dispatchEvent(mousemove);
      expect(grid.style).to.have.property(
        "grid-template-columns",
        "150px 1fr 24rem"
      );
      window.dispatchEvent(new Event("mouseup"));
      mousemove["clientX"] = 200;
      window.dispatchEvent(mousemove);
      expect(grid.style).to.have.property(
        "grid-template-columns",
        "150px 1fr 24rem"
      );
    });
  });
});
