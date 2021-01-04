import * as context from "./api/context";

export type HTTPMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type MaybePromise<T> = Promise<T> | T;

export type LogFunction = (...args: any) => void;

export type APILogger = Record<"error" | "info" | "log" | "warn", LogFunction>;

export type APIContext = typeof context & {
  log?: APILogger;
  cookies?: Record<string, string>;
};

export type APIResolver<P = any, C = any, R = any> = (
  params: P,
  context: APIContext & C
) => MaybePromise<R>;

export type APIResolvers = Record<
  string,
  Partial<Record<HTTPMethod, APIResolver>>
>;

export type APIError = { name: string; message: string };

export type APIErrorResponse = {
  errors: Array<APIError>;
  code?: number;
};
