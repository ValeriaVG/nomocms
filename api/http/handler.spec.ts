import { Readable } from "stream";
import { Test, expect } from "tiny-jest";
import createHandler from "./handler";
import { Ctx } from "./router";

export const test = new Test("Request Handler");
const { it } = test;

const createTestResponse = (): any => ({
  statusCode: null,
  body: [],
  finished: false,
  headers: new Map<string, string>(),
  write(chunk) {
    this.body.push(chunk.toString());
  },
  end() {
    this.finished = true;
  },
  setHeader(key: string, value: string) {
    this.headers.set(key, value);
  },
  hasHeader() {
    return false;
  },
});

it("handles simple requests", async () => {
  const modules = [
    {
      routes: {
        "/": () => ({
          status: 200,
          body: `index page`,
        }),
        "/version": ({ version }) => ({
          status: 200,
          body: { version },
        }),
      },
    },
    {
      routes: {
        "/health": () => ({
          status: 200,
          body: Buffer.from("health page"),
        }),
      },
    },
  ];
  const context = { version: Math.random() } as any;
  const handle = createHandler(modules, context);
  const indexResponse = createTestResponse();
  await handle({ url: "/", method: "GET" } as any, indexResponse);
  expect(indexResponse).toMatchObject({
    finished: true,
    body: ["index page"],
    statusCode: 200,
  });

  const versionResponse = createTestResponse();
  await handle({ url: "/version", method: "GET" } as any, versionResponse);
  expect(versionResponse).toMatchObject({
    finished: true,
    body: [JSON.stringify({ version: context.version })],
    statusCode: 200,
  });

  const healthResponse = createTestResponse();
  await handle({ url: "/health", method: "GET" } as any, healthResponse);
  expect(healthResponse).toMatchObject({
    finished: true,
    body: ["health page"],
    statusCode: 200,
  });

  it("can consume JSON body", async () => {
    const modules = [
      {
        routes: {
          "/:foo/:bar": async (_, input) => {
            return {
              status: 200,
              body: {
                ...input,
                queryParams: Object.fromEntries(input.queryParams.entries()),
              },
            };
          },
        },
      },
    ];
    const handle = createHandler(modules, {} as any);
    const req: any = Readable.from(['{"id":1}']);
    req["url"] = "/a/b?q=search";
    req["method"] = "GET";
    req["headers"] = { "content-type": "application/json" };
    const res = createTestResponse();
    await handle(req, res);
    expect(JSON.parse(res.body[0])).toMatchObject({
      body: { id: 1 },
      params: { foo: "a", bar: "b" },
      queryParams: { q: "search" },
    });
  });
});
