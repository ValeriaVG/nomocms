import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import Redis from "ioredis";
import Permissions, { Permission } from "./Permissions";

const redis = new Redis({ db: 9 });
const permissions = new Permissions({ redis });

describe("Permissions Integration Test", () => {
  before(() =>
    redis
      .multi()
      .flushdb()
      .set("permissions::global::usr_1", Permission.all)
      .set("permissions::global::usr_2", Permission.view)
      .set("permissions::pages::usr_2", Permission.all)
      .exec()
  );
  after(async () => {
    await redis.flushdb();
    redis.disconnect();
  });
  it("can check admin permissions", async () => {
    expect(
      await permissions.check({ user: "usr_1", permissions: Permission.delete })
    ).to.be.true;
    expect(
      await permissions.check({ user: "usr_1", permissions: Permission.list })
    ).to.be.true;
    expect(
      await permissions.check({
        user: "usr_1",
        permissions: Permission.create | Permission.read,
      })
    ).to.be.true;
  });
  it("can check limited permissions", async () => {
    expect(
      await permissions.check({
        user: "usr_2",
        permissions: Permission.create,
      })
    ).to.be.false;
    expect(
      await permissions.check({
        user: "usr_2",
        permissions: Permission.read,
      })
    ).to.be.true;
  });
  it("can check scoped permissions", async () => {
    expect(
      await permissions.check({
        user: "usr_1",
        permissions: Permission.all,
        scope: "pages",
      })
    ).to.be.true;
    expect(
      await permissions.check({
        user: "usr_2",
        permissions: Permission.all,
        scope: "pages",
      })
    ).to.be.true;
  });
  it("can set user permissions", async () => {
    expect(
      await permissions.set({ user: "usr_3", permissions: Permission.list })
    ).to.eq("OK");
    expect(await permissions.get({ user: "usr_3" })).to.eq(Permission.list);
    expect(
      await permissions.get({ user: "usr_3", scope: "anything::at:all" })
    ).to.eq(Permission.list);
    expect(
      await permissions.set({
        user: "usr_4",
        scope: "item::itm_1",
        permissions: Permission.list,
      })
    ).to.eq("OK");
    expect(await permissions.get({ user: "usr_4" })).to.eq(0);
    expect(
      await permissions.get({ user: "usr_4", scope: "anything::at:all" })
    ).to.eq(0);
    expect(
      await permissions.get({ user: "usr_4", scope: "item::itm_1" })
    ).to.eq(Permission.list);
  });
  it("can list all permissions for a user", async () => {
    const result = await permissions.map("usr_2");
    expect(result).to.have.property("size", 2);
    expect(result.get("global")).to.eq(Permission.view);
    expect(result.get("pages")).to.eq(Permission.all);
  });
  it("can list all users with a certain permission", async () => {
    const result = await permissions.users();
    expect(result).to.have.length.gte(2);
    for (let item of result) {
      expect(item.user).to.match(/^usr_\d+/);
      expect(item.scope).to.not.match(/^permissions::/);
      expect(item.value).to.be.a("number");
    }
  });
});
