import { describe, it, beforeEach, afterEach, after } from "mocha";
import { expect } from "chai";
import Redis from "ioredis";
import HashDataSource from "./HashDataSource";
import { TBoolean, TString } from "./datatypes";

const redis = new Redis({ db: 9 });

class Items extends HashDataSource<{
  id: string;
  username: string;
  email: string;
  active?: boolean;
}> {
  collection = "items";
  prefix = "itm";
  schema = {
    username: TString,
    email: TString,
    active: TBoolean,
  };
}

describe("HashDataSource Integration Test", () => {
  beforeEach(() => {
    redis.flushdb();
  });
  afterEach(() => {
    redis.flushdb();
  });
  after(() => {
    redis.disconnect();
  });
  it("can get item", async () => {
    const rnd = Math.random();
    await redis.hset(
      "items::itm_1",
      "id",
      "itm_1",
      "username",
      "superman" + rnd,
      "email",
      "clark@daily.planet",
      "active",
      "true"
    );
    const source = new Items({ redis });
    const item = await source.get("itm_1");
    expect(item).not.to.be.null;
    expect(item).to.have.property("id", "itm_1");
    expect(item).to.have.property("username", "superman" + rnd);
    expect(item).to.have.property("email", "clark@daily.planet");
    expect(item).to.have.property("active", true);
  });

  it("can update item", async () => {
    await redis.hset(
      "items::itm_1",
      "id",
      "itm_1",
      "username",
      "superman",
      "email",
      "clark@daily.planet",
      "active",
      "true"
    );
    const source = new Items({ redis });
    const item = await source.update("itm_1", { username: "Clark Kent" });
    expect(item).not.to.be.null;
    expect(item).to.have.property("id", "itm_1");
    expect(item).to.have.property("username", "Clark Kent");
    expect(item).to.have.property("email", "clark@daily.planet");
    expect(item).to.have.property("active", true);
  });

  it("doesnt create items on update", async () => {
    const source = new Items({ redis });
    const item = await source.update("itm_1", { username: "Clark Kent" });
    expect(item).to.be.null;
  });

  it("can create item", async () => {
    const source = new Items({ redis });
    const item = await source.create({
      username: "Clark Kent",
      email: "clark@daily.planet",
    });
    expect(item).not.to.be.null;
    expect(item).to.have.property("id", "itm_1");
    expect(item).to.have.property("username", "Clark Kent");
    expect(item).to.have.property("email", "clark@daily.planet");
  });

  it("can list items", async () => {
    await redis.hset(
      "items::itm_1",
      "id",
      "itm_1",
      "username",
      "superman",
      "email",
      "clark@daily.planet",
      "active",
      "true"
    );
    await redis.hset(
      "items::itm_2",
      "id",
      "itm_2",
      "username",
      "lexluther",
      "email",
      "lex@luther.corp"
    );
    const source = new Items({ redis });
    const list = await source.list();
    expect(list.items).to.have.length(2);
    const ids = list.items.map((item) => item.id);
    // Scan doesn't guarantee order in which items are returned
    expect(ids).to.contain("itm_1");
    expect(ids).to.contain("itm_2");
    expect(list.nextOffset).to.be.a("string");
  });
  it("can delete items", async () => {
    await redis.hset(
      "items::itm_1",
      "id",
      "itm_1",
      "username",
      "superman",
      "email",
      "clark@daily.planet",
      "active",
      "true"
    );

    const source = new Items({ redis });
    const result = await source.delete("itm_1");
    expect(result).to.have.property("deleted", true);
    const exists = await redis.exists("items::itm_1");
    expect(exists).to.be.eq(0);
  });
});
