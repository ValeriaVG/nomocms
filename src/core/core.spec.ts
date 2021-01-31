import { describe, it } from "mocha";
import { expect } from "chai";
import request from "supertest";
import middleware from "./.";
import { HTTPNotFound } from "./errors";

const items = new Map<string, { id: string; title: string }>([
  ["itm_1", { id: "itm_1", title: "Item#1" }],
]);

const ctx: any = { items };

const routes = {
  "/api/item": {
    GET: ({ id }, { items }) => {
      return { item: items.get(id) };
    },
    POST: ({ input }, { items }: typeof ctx) => {
      const id = "itm_" + items.size;
      const item = { id, ...input };
      // We're not pushing to the items to keep tests clean
      return { item, code: 201 };
    },
    DELETE: () => ({
      success: true,
    }),
  },
  "/api/items": { GET: () => ({ items: [...items.entries()] }) },
  "/api/err404": {
    GET: () => {
      throw new HTTPNotFound();
    },
  },
  "/api/err": {
    GET: () => {
      throw new Error("Something happened");
    },
  },
};

let api;
before(async () => {
  api = await middleware({ routes }, ctx);
});

describe("API Middleware Integration test", () => {
  it("GET /api/item", (done) => {
    request(api)
      .get("/api/item?id=itm_1")
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.item).to.have.property("id", "itm_1");
        done();
      });
  });
  it("GET /api/items", (done) => {
    request(api)
      .get("/api/items")
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property("items");
        expect(res.body.items).to.have.length(1);
        done();
      });
  });
  it("POST /api/item", (done) => {
    request(api)
      .post("/api/item")
      .set("Accept", "application/json")
      .send({ title: "Item#2" })
      .expect(201)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.item).to.have.property("title", "Item#2");
        done();
      });
  });
  it("DELETE /api/item", (done) => {
    request(api)
      .delete("/api/item?all=true")
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property("success", true);
        done();
      });
  });
  it("Error response with a code", (done) => {
    request(api)
      .get("/api/err404")
      .expect(404)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.deep.equal({
          name: "Error",
          message: "Not Found",
        });
        done();
      });
  });
  it("Generic Error response", (done) => {
    request(api)
      .get("/api/err")
      .expect(500)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.deep.equal({
          name: "Error",
          message: "Internal Server Error",
        });
        done();
      });
  });
});
