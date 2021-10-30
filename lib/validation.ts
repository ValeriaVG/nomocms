import * as T from "typed";
import { HTTPError } from "./errors";
import { HTTPStatus } from "./HTTPStatus";

export class ValidationError extends HTTPError {
  constructor(public errors: T.Err[]) {
    super(HTTPStatus.BadRequest, errors.map((e) => e.message).join(","));
  }
}
