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

  return Object.fromEntries(
    ["get", "post", "put", "patch", "delete"].map((method) => {
      const methodUC = method.toUpperCase() as HTTPMethod;
      if (["get", "delete"].includes(method))
        return [
          method,
          <T>(path: string) => exec<T>(path, { method: methodUC }),
        ];
      return [
        method,
        <T>(path: string, body?: any) =>
          exec<T>(path, { method: methodUC, body }),
      ];
    })
  ) as Record<"get" | "delete", <T>(path: string) => T> &
    Record<"post" | "put" | "patch", <T>(path: string, body?: any) => T>;
}

export default createAPIFetcher(
  process.env.API_URL,
  (typeof window !== "undefined" && window?.fetch) || ((() => {}) as any)
);
