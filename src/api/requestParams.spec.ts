import { describe, it } from "mocha";
import { expect } from "chai";
import { IncomingMessage } from "http";
import { Readable } from "stream";
import requestParams from "./requestParams";

const mockRequest = ({
  url,
  type,
  body,
  method,
}: {
  url?: string;
  type?: string;
  body?: string;
  method?: string;
}): IncomingMessage => {
  const stream = Readable.from([Buffer.from(body ?? "")]) as any;
  stream.headers = {
    "content-type": type,
    "content-length": body?.length,
  };
  stream.url = url;
  stream.method = method ?? "POST";
  return stream;
};

describe("requestParams", () => {
  it("parses JSON body", async () => {
    const req = mockRequest({
      type: "application/json",
      body: '{"success":true}',
    });
    expect(await requestParams(req)).to.deep.eq({
      input: { success: true },
      files: {},
    });
  });
  it("parses query params", async () => {
    const req = mockRequest({
      url: "/api/items?limit=10&offset=5",
      method: "GET",
    });
    expect(await requestParams(req)).to.deep.eq({ limit: "10", offset: "5" });
  });
  it("parses url encoded form", async () => {
    const req = mockRequest({
      url: "/api/item?id=1",
      type: "application/x-www-form-urlencoded",
      body: "title=Item&published=true",
    });
    expect(await requestParams(req)).to.deep.eq({
      id: "1",
      input: {
        title: "Item",
        published: "true",
      },
      files: {},
    });
  });
  it("parses multipart form data", async () => {
    const req = mockRequest({
      url: "/api/item?id=1",
      type: "multipart/form-data; boundary=12345",
      body:
        "--12345\r\n" +
        'Content-Disposition: form-data; name="name"\r\n\r\n' +
        "Example\r\n" +
        "--12345\r\n" +
        'Content-Disposition: form-data; name="file1"; filename="file1.txt"\r\n' +
        "Content-Type: text/plain\r\n\r\n" +
        "File Contents\r\n" +
        "--12345--",
    });
    const params = await requestParams(req);
    expect(params).to.have.property("id", "1");
    expect(params.input).to.have.property("name", "Example");
    expect(params.files.file1).to.have.property("name", "file1.txt");
  });
});
