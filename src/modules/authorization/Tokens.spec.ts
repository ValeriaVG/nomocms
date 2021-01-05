import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import Redis from "ioredis";
import Tokens from "./Tokens";

const redis = new Redis({ db: 9 });
const tokens = new Tokens({ redis });

const createdAt = Date.now();
const ipnum = 2835744532;

describe("Tokens Integration Test", () => {
  before(() =>
    redis
      .multi()
      .flushdb()
      .set("tokens::amp-example-token", "usr_1")
      .zadd(
        "tokens::usr_1",
        createdAt.toString(),
        "amp-example-token::2835744532"
      )
      .set("tokens::amp-another-token", "usr_2")
      .zadd(
        "tokens::usr_2",
        createdAt.toString(),
        "amp-another-token::2835744532"
      )
      .set("tokens::amp-yet-another-token", "usr_3")
      .zadd(
        "tokens::usr_3",
        createdAt.toString(),
        "amp-yet-another-token::2835744532"
      )
      .exec()
  );
  after(async () => {
    await redis.flushdb();
    redis.disconnect();
  });
  it("can get user by token", async () => {
    const id = await tokens.get("amp-example-token");
    expect(id).to.eq("usr_1");
  });
  it("can get tokens for user", async () => {
    const list = await tokens.list("usr_1");
    expect(list).to.have.length(1);
    expect(list[0]).to.have.property("token", "amp-example-token");
    expect(list[0]).to.have.property("createdAt", createdAt);
    expect(list[0]).to.have.property("ip", ipnum);
  });

  it("can delete all tokens for user", async () => {
    const result = await tokens.deleteAll("usr_2");
    expect(result).to.eq(1);
    const list = await tokens.list("usr_2");
    expect(list).to.have.length(0);
    expect(await tokens.list("usr_1")).to.have.length(1);
  });

  it("can delete token for user", async () => {
    const result = await tokens.delete({
      id: "usr_3",
      token: "amp-yet-another-token",
    });
    expect(result).to.eq(1);
    const list = await tokens.list("usr_3");
    expect(list).to.have.length(0);
    expect(await tokens.list("usr_1")).to.have.length(1);
  });

  it("can save token for user", async () => {
    const result = await tokens.save({
      id: "usr_4",
      token: "amp-some-token",
    });
    expect(result).to.eq(1);
    const list = await tokens.list("usr_4");
    expect(list).to.have.length(1);
    expect(await tokens.list("usr_1")).to.have.length(1);
  });
});
