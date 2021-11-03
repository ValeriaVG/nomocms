import { Test, expect } from "tiny-jest";
import http from "http";
import request from "supertest";

import createHandler from "api/http/handler";
import { syncSchema } from "api";
import account from ".";
import { createTestDB } from "lib/testDB";
import parseCookies from "lib/cookies";

const db = createTestDB();
export const test = new Test("Modules/Account");
const { it, before, after } = test;

before(async () => {
  await db.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
});
after(() => db.end());

const modules = [account];

const superuser = { email: "clark.kent@daily.planet", password: "12345" };
const ctx = { db } as any;

it("can create an account & login", async () => {
  await syncSchema(db, modules);
  const app = http.createServer(createHandler(modules, ctx));
  const credentials = { email: "User@domain.com", password: "12345" };
  await request(app).post("/account/login").send(credentials).expect(400);
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
    .post("/account/login")
    .send(credentials)
    .expect(200, createAccountResponse.body);
  const loginCookie = parseCookies(loginResponse.headers["set-cookie"][0]);
  const currentUserResponse = await request(app)
    .get("/account")
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200, loginResponse.body);
  expect(currentUserResponse.headers["set-cookie"]).toBeTruthy;
  const cookie = parseCookies(currentUserResponse.headers["set-cookie"][0]);
  expect(cookie.token).toEqual(loginCookie.token);
  expect(new Date(cookie.Expires as string).getTime()).toBeGreaterThanOrEqual(
    new Date(loginCookie.Expires as string).getTime()
  );
});

it("can crud an account", async () => {
  await syncSchema(db, modules);
  const app = http.createServer(createHandler(modules, ctx));
  const credentials = { email: "editable@domain.com", password: "123456" };

  await request(app).post("/account").send(credentials).expect(201);

  const loginResponse = await request(app)
    .post("/account/login")
    .send(credentials)
    .expect(200);
  const loginCookie = parseCookies(loginResponse.headers["set-cookie"][0]);
  const updateUserResponse = await request(app)
    .patch("/account")
    .send({ email: "updated@domain.com" })
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200);

  await request(app)
    .get("/account")
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200, updateUserResponse.body);
  const newCredentials = { email: "updated@domain.com", password: "54321" };
  const updaterPasswordResponse = await request(app)
    .patch("/account")
    .send(newCredentials)
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200);

  await request(app)
    .delete("/account/login")
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200);
  await request(app)
    .get("/account")
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(401);

  await request(app)
    .post("/account/login")
    .send(newCredentials)
    .expect(200, updaterPasswordResponse.body);
});

it("can login as superuser & list accounts", async () => {
  const app = http.createServer(createHandler(modules, ctx));
  const loginResponse = await request(app)
    .post("/account/login")
    .send(superuser)
    .expect(200);
  const loginCookie = parseCookies(loginResponse.headers["set-cookie"][0]);
  const result = await request(app)
    .get("/accounts?query=user@domain.com&limit=1")
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200);
  expect(result.body.items).toMatchObject([{ email: "user@domain.com" }]);
  await request(app)
    .get("/accounts?query=rubbish")
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200, { items: [] });
  await request(app)
    .get("/accounts?limit=0")
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200, { items: [] });
});

it("fails on incorrect requests", async () => {
  const app = http.createServer(createHandler(modules, ctx));
  await request(app).post("/account/login").send({}).expect(400);
  await request(app)
    .post("/account/login")
    .send({ email: "not-email@@", password: "12345" })
    .expect(400);
  await request(app)
    .post("/account/login")
    .send({ email: "name.surname@domain.com", password: "1234" })
    .expect(400);
  await request(app)
    .post("/account/login")
    .send({ email: "name.surname@domain.com", password: 12345 })
    .expect(400);
});
