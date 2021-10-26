import { Test, expect } from "tiny-jest";
import createHandler from "./handler";

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
  const context = { version: Math.random() };
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
});
