import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import Tokens from "./Tokens";
import { Client } from "pg";
import { createTable, dropTable, insertInto } from "core/sql";

const db = new Client({ user: "amp-cms", password: "amp-cms" });
const tokens = new Tokens({ db });

describe("Tokens Integration Test", () => {
  before(async () => {
    await db.connect();
    try {
      await db.query("BEGIN");
      await db.query(dropTable(tokens.collection, { ifExists: true }));
      await db.query(createTable(tokens.collection, tokens.schema));
      await db.query(
        ...insertInto(tokens.collection, {
          id: "amp-example-token",
          user_id: 1,
          ip: "127.0.0.1",
        })
      );
      await db.query(
        ...insertInto(tokens.collection, {
          id: "amp-another-token",
          user_id: 2,
        })
      );
      await db.query(
        ...insertInto(tokens.collection, {
          id: "amp-yet-another-token",
          user_id: 3,
        })
      );
      await db.query("COMMIT");
    } catch (error) {
      console.error(error);
    }
  });
  after(() => db.end());

  it("can get user by token", async () => {
    const token = await tokens.get("amp-example-token");
    expect(token).to.have.property("user_id", 1);
    expect(token).to.have.property("created");
    expect(token).to.have.property("expires");
    expect(token).to.have.property("ip", "127.0.0.1");
  });

  it("can delete all tokens for user", async () => {
    const result = await tokens.deleteAll(2);
    expect(result).to.deep.eq({ deleted: 1 });
  });

  it("can delete token for user", async () => {
    const result = await tokens.deleteOne({
      user_id: 3,
      token: "amp-yet-another-token",
    });
    expect(result).to.deep.eq({ deleted: true });
  });

  it("can save token for user", async () => {
    const token = await tokens.save({
      user_id: 4,
      token: "amp-some-token",
    });
    expect(token).to.have.property("user_id", 4);
    expect(token).to.have.property("created");
    expect(token).to.have.property("expires");
    expect(token).to.have.property("ip", null);
  });
});
