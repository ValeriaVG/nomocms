import { Test, expect } from "tiny-jest";
import { Pool } from "pg";
import http from "http";
import request from "supertest";

import createHandler from "api/http/handler";
import { syncSchema } from "api";
import account from ".";
import { parseCookies } from "./routes/login";
import { createTestDB } from "lib/testDB";

const db = createTestDB();
export const test = new Test("Modules/Account");
const { it, before, after } = test;

before(async () => {
  await db.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
});
after(() => db.end());

const modules = [account];

it("can create an account & login", async () => {
  await syncSchema(db, modules);
  const app = http.createServer(createHandler(modules, { db }));
  const credentials = { email: "User@domain.com", password: "12345" };
  await request(app).post("/login").send(credentials).expect(400);
  const createAccountResponse = await request(app)
    .post("/account")
    .send(credentials)
    .expect(201);
  expect(createAccountResponse.body).toMatchObject({
    user: { email: credentials.email.toLowerCase() },
  });
  expect(createAccountResponse.body.user.id.length).toBe(36);
  expect(createAccountResponse.body.user.password).toBe(undefined);
  expect(createAccountResponse.body.user.pwhash).toBe(undefined);
  expect(createAccountResponse.headers["set-cookie"]).toBeTruthy;

  const loginResponse = await request(app)
    .post("/login")
    .send(credentials)
    .expect(200, createAccountResponse.body);
  const loginCookie = parseCookies(loginResponse.headers["set-cookie"][0]);
  const currentUserResponse = await request(app)
    .get("/login")
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200, loginResponse.body);
  expect(currentUserResponse.headers["set-cookie"]).toBeTruthy;
  const cookie = parseCookies(currentUserResponse.headers["set-cookie"][0]);
  expect(cookie.token).toEqual(loginCookie.token);
  expect(
    new Date(cookie.Expires as string).getTime() >=
      new Date(loginCookie.Expires as string).getTime()
  ).toBe(true);
});

it("can login as superuser & list accounts", async () => {
  const superuser = { email: "clark.kent@daily.planet", password: "12345" };
  const app = http.createServer(createHandler(modules, { db }));
  const loginResponse = await request(app)
    .post("/login")
    .send(superuser)
    .expect(200);
  const loginCookie = parseCookies(loginResponse.headers["set-cookie"][0]);
  const result = await request(app)
    .get("/account?query=user@domain.com&limit=1")
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200);
  expect(result.body.items).toMatchObject([{ email: "user@domain.com" }]);
  await request(app)
    .get("/account?query=rubbish")
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200, { items: [] });
  await request(app)
    .get("/account?limit=0")
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200, { items: [] });
});
