import { Test, expect } from "tiny-jest";
import { createAPIFetcher } from "./api";
export const test = new Test("API Fetcher");

const { it } = test;

it("can fetch data", async () => {
  const fakeFetch: any = async (url: string, options: any) => {
    return {
      json() {
        return { url, options };
      },
    };
  };
  const api = createAPIFetcher("http://example.com/", fakeFetch);
  expect(await api.get("get")).toMatchObject({
    url: "http://example.com/get",
    options: {
      method: "GET",
      body: undefined,
      headers: { "content-type": "application/json" },
    },
  });
  expect(await api.post("post", { v: 1 })).toMatchObject({
    url: "http://example.com/post",
    options: {
      method: "POST",
      body: '{"v":1}',
      headers: { "content-type": "application/json" },
    },
  });
  expect(await api.put("put", { v: 1 })).toMatchObject({
    url: "http://example.com/put",
    options: {
      method: "PUT",
      body: '{"v":1}',
      headers: { "content-type": "application/json" },
    },
  });
  expect(await api.delete("delete")).toMatchObject({
    url: "http://example.com/delete",
    options: {
      method: "DELETE",
      headers: { "content-type": "application/json" },
    },
  });
});
