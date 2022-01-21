import { Err } from "lib/typed";
import { HTTPError } from "./errors";
import { HTTPStatus } from "./HTTPStatus";

export class ValidationError extends HTTPError {
  constructor(public errors: Err[]) {
    super(HTTPStatus.BadRequest, errors.map((e) => e.message).join(","));
  }
}
