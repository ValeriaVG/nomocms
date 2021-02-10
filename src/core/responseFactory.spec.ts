import { describe, it } from "mocha";
import { expect } from "chai";
import request from "supertest";
import responseFactory from "./responseFactory";
import { Readable } from "stream";

describe("responseFactory Integration Test", () => {
  it("can send JSONResponse", (done) => {
    const middleware = (req, res) => {
      return responseFactory(req, res)({ message: "OK" });
    };
    request(middleware)
      .get("/")
      .expect(200)
      .expect("Content-Type", "application/json")
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property("message", "OK");
        done();
      });
  });
  it("can send ErrorResponse", async () => {
    const middleware = (req, res) => {
      return responseFactory(
        req,
        res
      )({
        errors: [{ name: "NotFound", message: "Page not found" }],
        code: 404,
      });
    };

    await request(middleware)
      .get("/")
      .expect(404)
      .expect("Content-Type", "application/json")
      .expect(
        '{"errors":[{"name":"NotFound","message":"Page not found"}],"code":404}'
      );
  });
  it.skip("can send AMPResponse", async () => {
    const middleware = (req, res) => {
      return responseFactory(
        req,
        res
      )({
        type: "amp",
        body: "<h1>Hello!</h1>",
      });
    };

    const res = await request(middleware)
      .get("/")
      .expect(200)
      .expect("Content-Type", "text/html");
  });
  it("can send HTMLResponse", async () => {
    const middleware = (req, res) => {
      return responseFactory(
        req,
        res
      )({
        type: "html",
        data: "<html><body><h1>Hello!</h1></html>",
      });
    };

    await request(middleware)
      .get("/")
      .expect(200)
      .expect("Content-Type", "text/html")
      .expect("<html><body><h1>Hello!</h1></html>");
  });
  it("can send DataResponse", async () => {
    const middleware = (req, res) => {
      return responseFactory(
        req,
        res
      )({
        type: "text/plain",
        data: Readable.from(["foo", "bar"]),
        length: 6,
      });
    };
    await request(middleware)
      .get("/")
      .expect(200)
      .expect("Content-Type", "text/plain")
      .expect("foobar");
  });
});
