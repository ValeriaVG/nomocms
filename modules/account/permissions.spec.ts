import { Test, expect } from "tiny-jest";
import { createTestDB } from "lib/testDB";
import account from ".";
import { syncSchema } from "api";
import { checkPermission, Permission } from "./lib/permissions";
import { randomUUID } from "crypto";
import http from "http";
import createHandler from "api/http/handler";
import request from "supertest";

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
      scope: "anything-else",
      permission: Permission.delete,
    })
  ).toBe(false);
});

it("performs access check correctly", async () => {
  const ctx = { db, req: {} as any };
  const app = http.createServer(createHandler(modules, ctx));
  const user = { id: randomUUID(), email: "access@test.net" };
  const token = randomUUID();

  await db.query(`INSERT INTO accounts (id,email,pwhash) VALUES ($1,$2,'')`, [
    user.id,
    user.email,
  ]);
  await db.query(
    `INSERT INTO account_tokens (token, account_id,expires_at) VALUES ($1,$2, NOW() + interval '1 month')`,
    [token, user.id]
  );
  await db.query(
    `INSERT INTO account_permissions (account_id,scope,permissions) VALUES ($1,$2,$3)`,
    [user.id, "images", Permission.all]
  );
  await db.query(
    `INSERT INTO account_permissions (account_id,scope,permissions) VALUES ($1,$2,$3)`,
    [user.id, "videos::video_id", Permission.view]
  );

  await request(app).get("/account/access/images").expect(401);
  await request(app)
    .get("/account/access/images")
    .set("Cookie", `token=${token}`)
    .expect(200);
  await request(app)
    .get("/account/access/videos")
    .set("Cookie", `token=${token}`)
    .expect(401);
  await request(app)
    .get("/account/access/videos/video_id")
    .set("Cookie", `token=${token}`)
    .expect(200);
  await request(app)
    .get("/account/access/images/video_id")
    .set("Cookie", `token=${token}`)
    .expect(401);
  await request(app)
    .get("/account/access/videos::video_id")
    .set("Cookie", `token=${token}`)
    .expect(({ status }) => status >= 400);
  await request(app)
    .get("/account/access/videos/video_id2")
    .set("Cookie", `token=${token}`)
    .expect(401);
});
