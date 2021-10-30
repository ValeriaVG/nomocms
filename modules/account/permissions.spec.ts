import { Test, expect } from "tiny-jest";
import { createTestDB } from "lib/testDB";
import account from ".";
import { syncSchema } from "api";
import { checkPermission, Permission } from "./lib/permissions";
import { randomUUID } from "crypto";

export const test = new Test("Modules/Account/Permissions");
const { it, before, after } = test;
const db = createTestDB();
before(async () => {
  await db.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
  await syncSchema(db, modules);
});
after(() => db.end());

const modules = [account];

it("properly checks user permissions", async () => {
  expect(
    await checkPermission(db, {
      user: { isSuperUser: true, email: "", id: null },
      scope: "content",
      permission: Permission.create,
    })
  ).toBe(true);
  const user = { id: randomUUID(), email: "random@user.test" };
  expect(
    await checkPermission(db, {
      user,
      scope: "content",
      permission: Permission.create,
    })
  ).toBe(false);
  await db.query(`INSERT INTO accounts(id,email,pwhash) VALUES($1,$2,'')`, [
    user.id,
    user.email,
  ]);
  await db.query(
    `INSERT INTO account_permissions(scope,account_id,permissions) VALUES('content',$1,$2)`,
    [user.id, Permission.all]
  );
  expect(
    await checkPermission(db, {
      user,
      scope: "content",
      permission: Permission.create,
    })
  ).toBe(true);
  await db.query(
    `INSERT INTO account_permissions(scope,account_id,permissions) VALUES('*',$1,$2)`,
    [user.id, Permission.read]
  );
  expect(
    await checkPermission(db, {
      user,
      scope: "anything-else",
      permission: Permission.read,
    })
  ).toBe(true);
  expect(
    await checkPermission(db, {
      user,
      scope: "content",
      permission: Permission.delete,
    })
  ).toBe(false);
});
