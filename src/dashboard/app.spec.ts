import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import sinon from "sinon";
import app from "./app";
import api from "./utils/api";

describe("dashboard", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });
  afterEach(() => {
    document.body.innerHTML = "";
    sinon.restore();
  });
  it("renders login page if not authorized", async () => {
    sinon.replace(api, "get", async () => ({ canAccessDashboard: false }));
    await app.init();
    expect(document.querySelector("input[type=password]")).not.to.be.null;
    expect(document.querySelector("aside")).to.be.null;
  });
  it("renders login page if api is unavailable", async () => {
    sinon.replace(api, "get", async () => {
      throw new Error("error");
    });
    await app.init();
    expect(document.querySelector("input[type=password]")).not.to.be.null;
    expect(document.querySelector("aside")).to.be.null;
  });
  it("renders login page if api returned error", async () => {
    sinon.replace(api, "get", async () => ({
      code: 500,
      errors: ["something"],
    }));
    await app.init();
    expect(document.querySelector("input[type=password]")).not.to.be.null;
    expect(document.querySelector("aside")).to.be.null;
  });
  it("renders dashboard if authorized", async () => {
    sinon.replace(api, "get", async () => ({
      canAccessDashboard: true,
    }));
    await app.init();
    expect(document.querySelector("input[type=password]")).to.be.null;
    expect(document.querySelector("aside")).not.to.be.null;
    expect(document.querySelector("main")).not.to.be.null;
  });
});
