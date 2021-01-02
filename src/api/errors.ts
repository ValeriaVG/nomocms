import { HTTPMethod } from "../types";

export class HTTPError extends Error {
  constructor(public code: number, public message: string) {
    super(message);
    this.code = code;
  }
}

export class HTTPNotFound extends HTTPError {
  constructor(message?: string) {
    super(404, message ?? "Not Found");
  }
}

export class HTTPMethodNotAllowed extends HTTPError {
  constructor(methods: HTTPMethod[]) {
    super(405, `Allowed: ${methods.join(", ")}`);
  }
}

export class HTTPServerError extends HTTPError {
  constructor(message?: string) {
    super(500, message ?? "Internal Server Error");
  }
}
