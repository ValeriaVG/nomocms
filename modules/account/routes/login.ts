import { superuser } from "api/config";
import { RouteHandler } from "api/http/router";
import { HTTPStatus } from "lib/HTTPStatus";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { IncomingMessage } from "http";
import { parse } from "querystring";

export const login: RouteHandler<
  { db: Pool },
  { body: { email: string; password: string } }
> = async ({ db }, { body: { email, password } }) => {
  const error = {
    status: HTTPStatus.BadRequest,
    body: {
      error: "Incorrect credentials",
    },
  };
  if (!email || !password) return error;
  let user: { id: string | null; email: string; isSuperUser?: boolean };
  if (
    superuser.email &&
    email.trim().toLowerCase() === superuser.email &&
    superuser.password === password
  ) {
    user = { id: null, email: superuser.email, isSuperUser: true };
  } else {
    const result = await db.query(`select * from accounts where email=$1`, [
      email.trim().toLowerCase(),
    ]);
    if (!result.rowCount) return error;
    const existingUser = result.rows[0];
    if (!(await bcrypt.compare(password, existingUser.pwhash))) return error;
    user = { id: existingUser.id, email: existingUser.email };
  }
  if (!user.id && !user.isSuperUser) return error;
  const token = randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1_000);
  await db.query(
    `INSERT INTO account_tokens (token,account_id,created_at,expires_at,is_superuser) VALUES($1,$2,$3,$4,$5)`,
    [token, user.id, createdAt, expiresAt, user.isSuperUser]
  );
  return {
    status: 200,
    body: { user },
    headers: {
      "Set-Cookie": `token=${token};HttpOnly;Path=/;Expires=${expiresAt.toUTCString()}`,
    },
  };
};

export const logout: RouteHandler<{ db: Pool; req: IncomingMessage }> = async ({
  db,
  req,
}) => {
  const cookies = req.headers.cookie;
  const error = {
    status: HTTPStatus.Unauthorized,
    body: { error: "Unauthorized" },
  };
  if (!cookies) return error;
  const { token } = parse(cookies);
  if (!token) return error;
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

export function getCurrentAccount() {}
