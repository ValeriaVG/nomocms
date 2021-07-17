import { describe, it, before } from "mocha";
import { expect } from "chai";
import SnackBar from "./index";
describe("snack-bar", () => {
  let snackbar: SnackBar;
  before(() => {
    customElements.define("test-snack-bar", SnackBar);
    snackbar = document.createElement("test-snack-bar") as SnackBar;
    document.body.appendChild(snackbar);
  });
  beforeEach(() => {
    for (const nofification of snackbar.querySelectorAll("div")) {
      snackbar.removeChild(nofification);
    }
  });
  it("can create default notifications", () => {
    snackbar.addNotification({ type: "error" });
    snackbar.addNotification({ type: "success" });
    expect(snackbar.querySelector("div.error-notification")).to.not.be.null;
    expect(snackbar.querySelector("div.success-notification")).to.not.be.null;
  });
  it("can create notifications with text", () => {
    snackbar.addNotification({
      type: "error",
      title: "Oops!",
      message: "I did it again...",
    });
    snackbar.addNotification({
      type: "success",
      title: "Woohoo!",
      message: "I feel heavy metal...",
    });
    const error = snackbar.querySelector("div.error-notification");
    expect(error).to.not.be.null;
    expect(error.textContent).to.equal("Oops!I did it again...");

    const success = snackbar.querySelector("div.success-notification");
    expect(success).to.not.be.null;
    expect(success.textContent).to.equal("Woohoo!I feel heavy metal...");
  });
  it("closes on timeout if provided", (done) => {
    snackbar.addNotification({
      type: "success",
      timeoutMS: 99,
    });

    snackbar.addNotification({
      type: "error",
      timeoutMS: 100,
    });
    expect(snackbar.querySelector("div.error-notification")).not.to.be.null;
    expect(snackbar.querySelector("div.success-notification")).not.to.be.null;
    setTimeout(() => {
      expect(snackbar.querySelector("div.error-notification")).to.be.null;
      expect(snackbar.querySelector("div.success-notification")).to.be.null;
      done();
    }, 100);
  });
});
