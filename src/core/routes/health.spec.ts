import { describe, it } from "mocha";
import { expect } from "chai";
import health from "./health";

describe("health", () => {
  it("responds with ok", async () => {
    expect(
      await health({
        db: { query: async () => ({ rows: [{ status: "OK" }] }) } as any,
      })
    ).to.deep.equal({ db: "OK" });
  });
});
