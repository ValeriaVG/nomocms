import { describe, it, before } from "mocha";
import chai, { expect } from "chai";
import Analytics from "./Analytics";
import { insertInto } from "core/sql";
import { Client } from "pg";
import like from "chai-like";

chai.use(like);

describe("Analytics", () => {
  const db = new Client({ user: "nomocms", password: "nomocms" });
  before(async () => {
    await db.connect();
  });
  after(async () => {
    await db.end();
  });
  it("can calculate viewsPerDay", async () => {
    const analytics = new Analytics({ db } as any);
    await db.query(analytics.defaultMigrations.init.down);
    await db.query(analytics.defaultMigrations.init.up);
    await db.query(
      ...insertInto(
        analytics.collection,
        Array(9)
          .fill({ event: "pageview", path: "/" })
          .map((e, i) => ({
            ...e,
            time: new Date(`2021-01-0${i + 1}`),
          }))
      )
    );
    const records = await analytics.viewsPerDay({
      from: new Date("2021-01-01"),
      to: new Date("2021-01-05"),
    });
    expect(records).to.be.like([
      { count: 1 },
      { count: 1 },
      { count: 1 },
      { count: 1 },
      { count: 1 },
    ]);
  });
});
