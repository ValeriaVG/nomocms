import * as T from "typed";
import isEmail from "is-email";
import { HTTPError } from "./errors";
import { HTTPStatus } from "./HTTPStatus";

export class ValidationError extends HTTPError {
  constructor(public errors: T.Err[]) {
    super(HTTPStatus.BadRequest, errors.map((e) => e.message).join(","));
  }
}

export const emailType = T.map(T.string, (value) => {
  const email = value.trim().toLowerCase();
  return isEmail(email)
    ? T.success(email)
    : T.failure(T.toError(`'email' should be a valid email address`));
});

export const passwordType = T.map(T.string, (value) =>
  typeof value === "string" && value.length >= 5
    ? T.success(value)
    : T.failure(T.toError(`'password' should be at least 5 letters long`))
);
