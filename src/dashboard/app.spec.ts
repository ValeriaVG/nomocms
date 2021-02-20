import { describe, it } from "mocha";
import app from "./app";

describe("dashboard", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });
  it("renders", () => {
    app.init();
  });
});
