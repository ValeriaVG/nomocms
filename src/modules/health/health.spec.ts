import { describe, it } from "mocha";
import { expect } from "chai";
import routes from "./routes";

describe("health", () => {
  it("responds with ok", async () => {
    expect(
      await routes["/_health"]({
        db: { query: async () => ({ rows: [{ status: "OK" }] }) } as any,
      })
    ).to.deep.equal({ db: "OK" });
  });
});
