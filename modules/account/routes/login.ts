import * as T from "typed";
import { superuser } from "api/config";
import { RouteHandler } from "api/http/router";
import { HTTPStatus } from "lib/HTTPStatus";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { IncomingMessage } from "http";
import { AccountSettings, User } from "../types";
import { UnauthorizedError } from "lib/errors";
import { emailType, passwordType, ValidationError } from "lib/validation";

export const credentialsType = T.object({
  email: emailType,
  password: passwordType,
});

const SuperUser = {
  id: "superuser",
  email: superuser.email,
  isSuperUser: true,
};

const prepareToken = (token: string) => {
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1_000);
  return {
    createdAt,
    expiresAt,
    cookie: `token=${token};HttpOnly;Path=/;Expires=${expiresAt.toUTCString()}`,
  };
};

export const createToken = async (db: Pool, user: User) => {
  const token = randomUUID();
  const { createdAt, expiresAt, cookie } = prepareToken(token);
  await db.query(
    `INSERT INTO account_tokens (token,account_id,created_at,expires_at,is_superuser) VALUES($1,$2,$3,$4,$5)`,
    [
      token,
      user.isSuperUser ? null : user.id,
      createdAt,
      expiresAt,
      user.isSuperUser,
    ]
  );
  return cookie;
};

export const updateToken = async (db: Pool, token: string) => {
  const { expiresAt, cookie } = prepareToken(token);
  await db.query(`UPDATE account_tokens SET expires_at=$2 WHERE token=$1`, [
    token,
    expiresAt,
  ]);
  return cookie;
};

export const ensureCredentials = (credentials: any) => {
  const validation = credentialsType(credentials);
  if (validation.success === false)
    throw new ValidationError(validation.errors);
  return validation.value;
};

const getUserByCredentials = async (
  db: Pool,
  credentials: AccountSettings
): Promise<User | undefined> => {
  const { email, password } = ensureCredentials(credentials);
  if (
    superuser.email &&
    email === superuser.email &&
    superuser.password === password
  ) {
    return SuperUser;
  }
  const result = await db.query(`select * from accounts where email=$1`, [
    email,
  ]);
  if (!result.rowCount) return;
  const existingUser = result.rows[0];
  if (!(await bcrypt.compare(password, existingUser.pwhash))) return;
  return { id: existingUser.id, email: existingUser.email };
};

export const login: RouteHandler<{ db: Pool }, { body: AccountSettings }> =
  async ({ db }, { body: { email, password } }) => {
    const error = {
      status: HTTPStatus.BadRequest,
      body: {
        error: "Incorrect credentials",
      },
    };
    if (!email || !password) return error;
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

export const parseCookies = (cookies: string): Record<string, string> => {
  if (!cookies) return {};
  const map = new Map<string, string>();
  let key = "";
  let value = "";
  let isParsingKey = true;
  const flush = (force?: boolean) => {
    if (!force && isParsingKey) {
      isParsingKey = false;
      return;
    }
    if (!key) return;
    map.set(key.trim(), value.trim());
    key = "";
    value = "";
    isParsingKey = true;
  };
  for (const c of cookies) {
    switch (c) {
      case "=":
        flush();
        break;
      case ";":
        flush(true);
        break;
      default:
        if (isParsingKey) key += c;
        else value += c;
    }
  }
  flush();
  return Object.fromEntries(map.entries());
};

export const getCurrentToken = (req: IncomingMessage): string | undefined => {
  const cookies = req.headers?.cookie;
  if (!cookies) return;
  const { token } = parseCookies(cookies);
  if (!token) return;
  if (Array.isArray(token)) return token.pop();
  return token;
};

export const logout: RouteHandler<{ db: Pool; req: IncomingMessage }> = async ({
  db,
  req,
}) => {
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

export const getUserByToken = async (
  db: Pool,
  token: string
): Promise<User | undefined> => {
  if (!token) return;
  const result = await db.query(
    `SELECT accounts.* , is_superuser
    FROM account_tokens
    LEFT JOIN accounts ON accounts.id = account_id
    WHERE token=$1 AND expires_at>now()`,
    [token]
  );
  if (result.rowCount == 0) return;
  const { id, email, is_superuser } = result.rows[0];
  return is_superuser ? SuperUser : { id, email };
};

export const getCurrentAccount: RouteHandler<{
  db: Pool;
  req: IncomingMessage;
}> = async ({ db, req }) => {
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
