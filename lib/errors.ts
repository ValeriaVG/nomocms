import { HTTPStatus } from "./HTTPStatus";

export class HTTPError extends Error {
  constructor(public status: HTTPStatus, public message: string) {
    super(message);
  }
}

export const UnauthorizedError = new HTTPError(
  HTTPStatus.Unauthorized,
  "Unauthorized"
);

export const NotFoundError = new HTTPError(HTTPStatus.NotFound, "Not Found");
export const BadRequest = new HTTPError(HTTPStatus.BadRequest, "Bad Request");
