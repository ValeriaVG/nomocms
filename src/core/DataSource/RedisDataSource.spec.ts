import { describe, it, beforeEach, afterEach, after } from "mocha";
import { expect } from "chai";
import Redis from "ioredis";
import RedisDataSource from "./RedisDataSource";
import { TBoolean, TString } from "./datatypes";

const redis = new Redis({ db: 9 });

class Items extends RedisDataSource<{
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
    await redis
      .multi()
      .hset(
        "items::itm_1",
        "id",
        "itm_1",
        "username",
        "superman",
        "email",
        "clark@daily.planet",
        "active",
        "true"
      )
      .hset(
        "items::itm_2",
        "id",
        "itm_2",
        "username",
        "lexluther",
        "email",
        "lex@luther.corp"
      )
      .zadd("items", "0", "itm_1", "0", "itm_2")
      .exec();
    const source = new Items({ redis });
    const list = await source.list();
    expect(list.items).to.have.length(2);
    expect(list.items[0]).to.have.property("id", "itm_2");
    expect(list.items[1]).to.have.property("id", "itm_1");
    expect(list.nextOffset).to.be.null;
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

  it("can CRUDL", async () => {
    const source = new Items({ redis });
    const item1 = await source.create({ username: "clark" });
    expect(item1).to.have.property("id", "itm_1");
    expect(item1).to.have.property("username", "clark");
    const item2 = await source.upsert({ id: "usr_lex", username: "lex" });
    expect(item2).to.have.property("id", "usr_lex");
    expect(item2).to.have.property("username", "lex");
    const list = await source.list();
    expect(list).to.have.property("count", 2);
    expect(list).to.have.property("nextOffset", null);
    expect(list).to.have.property("items");
    expect(list.items[0]).to.have.property("id", "usr_lex");
    expect(list.items[1]).to.have.property("id", "itm_1");
    const partial = await source.list({ limit: 1 });
    expect(partial).to.have.property("count", 2);
    expect(partial).to.have.property("nextOffset", 1);
    expect(partial.items).to.have.length(1);
    const partial2 = await source.list({ offset: 1 });
    expect(partial2).to.have.property("count", 2);
    expect(partial2).to.have.property("nextOffset", null);
    expect(partial2.items).to.have.length(1);
    const del1 = await source.delete("itm_1");
    expect(del1).to.have.property("deleted", true);
    const del2 = await source.delete("usr_lex");
    expect(del2).to.have.property("deleted", true);
    const empty = await source.list();
    expect(empty).to.have.property("count", 0);
    expect(empty.items).to.have.length(0);
    expect(empty).to.have.property("nextOffset", null);
    expect(await source.get("itm_1")).to.be.null;
    expect(await source.get("usr_lex")).to.be.null;
  });
});
