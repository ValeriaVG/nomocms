import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import Permissions, { Permission } from "./Permissions";
import { mockDatabase } from "mocks";
import { createTable, insertInto } from "core/sql";

const db = mockDatabase();
const permissions = new Permissions({ db });

describe("Permissions Integration Test", () => {
  before(async () => {
    await db.query(
      createTable(permissions.collection, permissions.schema, {
        primaryKey: permissions.primaryKey,
      })
    );
    await db.query(
      ...insertInto(permissions.collection, {
        user_id: 1,
        permissions: Permission.all,
      })
    );
    await db.query(
      ...insertInto(permissions.collection, {
        user_id: 2,
        permissions: Permission.view,
      })
    );
    await db.query(
      ...insertInto(permissions.collection, {
        user_id: 2,
        scope: "pages",
        permissions: Permission.all,
      })
    );
  });

  it("can check admin permissions", async () => {
    expect(
      await permissions.check({ user_id: 1, permissions: Permission.delete })
    ).to.be.true;
    expect(
      await permissions.check({ user_id: 1, permissions: Permission.list })
    ).to.be.true;
    expect(
      await permissions.check({
        user_id: 1,
        permissions: Permission.create | Permission.read,
      })
    ).to.be.true;
  });
  it("can check limited permissions", async () => {
    expect(
      await permissions.check({
        user_id: 2,
        permissions: Permission.create,
      })
    ).to.be.false;
    expect(
      await permissions.check({
        user_id: 2,
        permissions: Permission.read,
      })
    ).to.be.true;
  });
  it("can check scoped permissions", async () => {
    expect(
      await permissions.check({
        user_id: 1,
        permissions: Permission.all,
        scope: "pages",
      })
    ).to.be.true;
    expect(
      await permissions.check({
        user_id: 2,
        permissions: Permission.all,
        scope: "pages",
      })
    ).to.be.true;
  });
  it("can set user permissions", async () => {
    expect(
      await permissions.set({ user_id: 3, permissions: Permission.list })
    ).to.deep.eq({
      user_id: 3,
      scope: "global",
      permissions: Permission.list,
    });
    expect(await permissions.getPermissions({ user_id: 3 })).to.eq(
      Permission.list
    );
    expect(
      await permissions.getPermissions({
        user_id: 3,
        scope: "anything::at:all",
      })
    ).to.eq(Permission.list);
    expect(
      await permissions.set({
        user_id: 4,
        scope: "item::itm_1",
        permissions: Permission.list,
      })
    ).to.deep.eq({
      user_id: 4,
      scope: "item::itm_1",
      permissions: Permission.list,
    });
    expect(await permissions.getPermissions({ user_id: 4 })).to.eq(0);
    expect(
      await permissions.getPermissions({
        user_id: 4,
        scope: "anything::at:all",
      })
    ).to.eq(0);
    expect(
      await permissions.getPermissions({ user_id: 4, scope: "item::itm_1" })
    ).to.eq(Permission.list);
  });
  it("can list all permissions for a user", async () => {
    const result = await permissions.map(2);
    expect(result).to.have.property("size", 2);
    expect(result.get("global")).to.eq(Permission.view);
    expect(result.get("pages")).to.eq(Permission.all);
  });
});
