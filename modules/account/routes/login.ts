import { RouteHandler } from "api/http/router";
import { HTTPStatus } from "lib/HTTPStatus";
import { UnauthorizedError } from "lib/errors";
import {
  createToken,
  getCurrentToken,
  getUserByToken,
  updateToken,
} from "../lib/token";
import { getUserByCredentials } from "../lib/credentials";

export const login: RouteHandler = async (
  { db },
  { body: { email, password } }
) => {
  const error = {
    status: HTTPStatus.BadRequest,
    body: {
      error: "Incorrect credentials",
    },
  };
  const user = await getUserByCredentials(db, { email, password });
  if (!user || (!user.id && !user.isSuperUser)) return error;
  const tokenCookie = await createToken(db, user);
  return {
    status: 200,
    body: { user },
    headers: {
      "Set-Cookie": tokenCookie,
    },
  };
};

export const logout: RouteHandler = async ({ db, req }) => {
  const token = getCurrentToken(req);
  if (!token) throw UnauthorizedError;
  await db.query(`DELETE FROM account_tokens WHERE token=$1`, [token]);
  return {
    status: HTTPStatus.OK,
    body: {
      message: "You have been logged out",
    },
    headers: {
      "Set-Cookie": `token=;HttpOnly;Path=/;Expires=${new Date(
        0
      ).toUTCString()}`,
    },
  };
};

export const getCurrentAccount: RouteHandler = async ({ db, req }) => {
  const token = getCurrentToken(req);
  const user = await getUserByToken(db, token);
  if (!user) throw UnauthorizedError;
  const tokenCookie = await updateToken(db, token);
  return {
    status: 200,
    body: { user },
    headers: { "Set-Cookie": tokenCookie },
  };
};
