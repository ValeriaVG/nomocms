import { HTTPMethod } from "lib/HTTPMethod";

export function createAPIFetcher(url: string, fetchFn = fetch) {
  const exec = async <T>(
    path: string,
    {
      method,
      body,
      headers,
    }: { method: HTTPMethod; body?: any; headers?: HeadersInit }
  ) => {
    const options: RequestInit = {
      method,
      credentials: "include",
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    options.headers = Object.assign(
      { "content-type": "application/json" },
      headers || {}
    );
    const response = await fetchFn(`${url}${path}`, options);
    const result = await response.json();
    return result as T;
  };
  return {
    get: <T>(path: string) => exec<T>(path, { method: HTTPMethod.GET }),
    post: <T>(path: string, body: any) =>
      exec<T>(path, { method: HTTPMethod.POST, body }),
    put: <T>(path: string, body: any) =>
      exec<T>(path, { method: HTTPMethod.PUT, body }),
    patch: <T>(path: string, body: any) =>
      exec<T>(path, { method: HTTPMethod.PUT, body }),
    delete: <T>(path: string) => exec<T>(path, { method: HTTPMethod.DELETE }),
  };
}

export default createAPIFetcher(
  "http://localhost:3030",
  (typeof window !== "undefined" && window?.fetch) || ((() => {}) as any)
);
