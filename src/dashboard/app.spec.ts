import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import sinon from "sinon";
import app from "./app";
import api from "./utils/api";

describe("dashboard", () => {
  beforeEach(() => {
    app.setState({ loading: false, hasAccess: false });
    document.body.innerHTML = "";
  });
  afterEach(() => {
    app.stop();
    sinon.restore();
  });
  it("renders login page if not authorized", async () => {
    sinon.replace(
      api,
      "query",
      async () =>
        ({
          data: { access: { canAccessDashboard: false } },
        } as any)
    );
    await app.mount(document.body);
    expect(document.querySelector("input[type=password]")).not.to.be.null;
    expect(document.querySelector("aside")).to.be.null;
  });
  it("renders login page if api is unavailable", async () => {
    sinon.replace(api, "query", async () => {
      return { errors: [{ message: "Error" }] };
    });
    await app.mount(document.body);
    expect(document.querySelector("input[type=password]")).not.to.be.null;
    expect(document.querySelector("aside")).to.be.null;
  });
  it("renders login page if api returned error", async () => {
    sinon.replace(
      api,
      "query",
      async () =>
        ({
          code: 500,
          errors: [{ message: "something" }],
        } as any)
    );
    await app.mount(document.body);
    expect(document.querySelector("input[type=password]")).not.to.be.null;
    expect(document.querySelector("aside")).to.be.null;
  });
  it("renders dashboard if authorized", async () => {
    sinon.replace(
      api,
      "query",
      async () =>
        ({
          data: {
            access: {
              canAccessDashboard: true,
            },
          },
        } as any)
    );
    await app.mount(document.body);
    expect(document.querySelector("input[type=password]")).to.be.null;
    expect(document.querySelector("aside")).not.to.be.null;
    expect(document.querySelector("main")).not.to.be.null;
  });
});
