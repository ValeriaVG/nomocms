import { User } from "modules/authorization/Users";
import { Readable } from "stream";
import * as context from "./context";

export type HTTPMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type MaybePromise<T> = Promise<T> | T;

export type LogFunction = (...args: any) => void;

export type APILogger = Record<"error" | "info" | "log" | "warn", LogFunction>;

export type APIContext = typeof context & {
  log?: APILogger;
  cookies?: Record<string, string>;
  token?: string;
  user?: User;
  canAccessDashboard?: boolean;
};

export type SimpleTypes = string | number | boolean | null;

export type GenericResponse = {
  code?: number;
  type?: string;
};

export type ResponseData = string | Readable;

export type ErrorResponse = GenericResponse & {
  errors: Array<Error>;
};

export type AMPResponse = GenericResponse & {
  type: "amp";
  body?: string;
  head?: string;
};
export type JSONObject = Record<
  string,
  SimpleTypes | Record<string, SimpleTypes>
>;
export type JSONResponse = GenericResponse & JSONObject;
export type DataResponse = GenericResponse & {
  type: string;
  data: ResponseData;
  length: number;
};

export type HTMLResponse = DataResponse & {
  type: "html";
};

export type RouteResponse =
  | ErrorResponse
  | AMPResponse
  | JSONResponse
  | HTMLResponse
  | DataResponse;

export type ResolverFn<P = any, C = any, R extends RouteResponse = any> = (
  params: P,
  context: APIContext & C
) => MaybePromise<R>;

export type Routes = {
  [path: string]: ResolverFn | Partial<Record<HTTPMethod, ResolverFn>>;
};
