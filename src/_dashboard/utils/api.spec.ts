import { describe, it } from "mocha";
import { expect } from "chai";
import { Api } from "./api";
import fetch from "node-fetch";

describe("utils.api", () => {
  const api = new Api("https://jsonplaceholder.typicode.com");
  api.fetch = fetch as any;
  it("can send get requests", async () => {
    expect(await api.get("/todos/1")).to.have.property("id", 1);
  });
  it("can send post requests", async () => {
    expect(await api.post("/posts", { title: "test" })).to.have.property(
      "title",
      "test"
    );
  });
});
