import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import sinon from "sinon";
import app from "./app";
import api from "./utils/api";

const init = () =>
  new Promise((r) => {
    app.mount(document.body);
    const onLoad = ({ loading }: { loading: boolean }) => {
      if (!loading) {
        app.offUpdate(onLoad);
        r(true);
      }
    };
    app.onUpdate(onLoad);
  });

describe("dashboard", () => {
  beforeEach(() => {
    app.setState({ loading: false, hasAccess: false });
    document.body.innerHTML = "";
  });
  afterEach(() => {
    document.body.innerHTML = "";
    sinon.restore();
  });
  it("renders login page if not authorized", async () => {
    sinon.replace(api, "query", async () => ({
      data: { access: { canAccessDashboard: false } },
    }));
    await app.mount(document.body);
    expect(document.querySelector("input[type=password]")).not.to.be.null;
    expect(document.querySelector("aside")).to.be.null;
  });
  it("renders login page if api is unavailable", async () => {
    sinon.replace(api, "query", async () => {
      throw new Error("error");
    });
    await init();
    expect(document.querySelector("input[type=password]")).not.to.be.null;
    expect(document.querySelector("aside")).to.be.null;
  });
  it("renders login page if api returned error", async () => {
    sinon.replace(api, "query", async () => ({
      code: 500,
      errors: ["something"],
    }));
    await init();
    expect(document.querySelector("input[type=password]")).not.to.be.null;
    expect(document.querySelector("aside")).to.be.null;
  });
  it("renders dashboard if authorized", async () => {
    sinon.replace(api, "query", async () => ({
      data: {
        access: {
          canAccessDashboard: true,
        },
      },
    }));
    await init();
    expect(document.querySelector("input[type=password]")).to.be.null;
    expect(document.querySelector("aside")).not.to.be.null;
    expect(document.querySelector("main")).not.to.be.null;
  });
});
