import { Test, expect } from "tiny-jest";
import http from "http";
import request from "supertest";

import createHandler from "api/http/handler";
import { syncSchema } from "api";
import account from "modules/account";
import content from ".";
import { createTestDB } from "lib/testDB";
import parseCookies from "modules/account/lib/cookies";

const db = createTestDB();
export const test = new Test("Modules/Content");
const { it, before, after } = test;

before(async () => {
  await db.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
  await syncSchema(db, modules);
});
after(() => db.end());

const modules = [account, content];

const superuser = { email: "clark.kent@daily.planet", password: "12345" };
const ctx = { db };
it("can create content", async () => {
  const app = http.createServer(createHandler(modules, ctx));
  const loginResponse = await request(app)
    .post("/account/login")
    .send(superuser)
    .expect(200);
  const loginCookie = parseCookies(loginResponse.headers["set-cookie"][0]);

  const createResponse = await request(app)
    .post("/content")
    .set("Cookie", `token=${loginCookie.token}`)
    .send({
      path: "/",
      content: "<h1>Page Title</h1><p>Page Content</p>",
    })
    .expect(201);
  const id = createResponse.body.page.id;
  await request(app)
    .get(`/content/${id}`)
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200, createResponse.body);

  const listResponse = await request(app)
    .get(`/content?limit=1`)
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200);

  expect(listResponse.body.items).toMatchObject([createResponse.body.page]);

  const updateResponse = await request(app)
    .put(`/content/${id}`)
    .send({ path: "/", content: "<h1>New Page Title</h1><p>Page Content</p>" })
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200);

  expect(updateResponse.body.page.content).toBe(
    "<h1>New Page Title</h1><p>Page Content</p>"
  );
  expect(updateResponse.body.page.updated_at).toBeTruthy;
  await request(app)
    .get(`/content/${id}`)
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200, updateResponse.body);

  await request(app)
    .delete(`/content/${id}`)
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(200);
  await request(app)
    .get(`/content/${id}`)
    .set("Cookie", `token=${loginCookie.token}`)
    .expect(404);
});

it("can preview content", async () => {
  const app = http.createServer(createHandler(modules, ctx));
  const loginResponse = await request(app)
    .post("/account/login")
    .send(superuser)
    .expect(200);
  const loginCookie = parseCookies(loginResponse.headers["set-cookie"][0]);

  const previewResponse = await request(app)
    .post("/content/preview")
    .set("Cookie", `token=${loginCookie.token}`)
    .send({
      content: "<h1>Page Title</h1><p>Page Content</p>",
    })
    .expect(200);
  expect(previewResponse.headers).toMatchObject({
    "content-type": "text/html",
    "content-length": "6613",
  });
  expect(
    previewResponse.text.includes("<h1>Page Title</h1><p>Page Content</p>")
  ).toBe(true);
});
