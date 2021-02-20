import { expect } from "chai";
import { Server } from "http";
import { AddressInfo } from "net";
import fetch from "node-fetch";
import createServer from "./server";
import { describe } from "mocha";
import { cleanup } from "core/context";

describe("server", () => {
  let server: Server;
  before(async () => {
    server = await createServer();
    server.listen(0);
  });
  it("works", async () => {
    const port = (server.address() as AddressInfo).port;
    expect(port).to.be.greaterThan(0);
    const response = await fetch(`http://localhost:${port}/_health`);
    expect(response.ok).to.be.true;
  });
  after(() => {
    server.close();
  });
});
