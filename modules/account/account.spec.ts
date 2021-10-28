import { Test, expect } from "tiny-jest";
import { Pool } from "pg";
import http from "http";
import request from "supertest";

import createHandler from "api/http/handler";
import { syncSchema } from "api";
import account from ".";

export const test = new Test("Modules/Account");
const { it, before, after } = test;

const db = new Pool({
  user: "nomocms",
  password: "nomocms",
  database: "nomotest",
});

before(async () => {
  await db.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
});
after(() => db.end());

it("can create an account & login", async () => {
  const modules = [account];
  await syncSchema(db, [account]);
  const context = { db };
  const app = http.createServer(createHandler(modules, context));
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
  await request(app)
    .post("/login")
    .send(credentials)
    .expect(200, createAccountResponse.body);
});
