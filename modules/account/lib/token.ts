import { randomUUID } from "crypto";
import { IncomingMessage } from "http";
import { Pool } from "pg";
import { User } from "../types";
import parseCookies from "./cookies";
import { SuperUser } from "./credentials";

export const getCurrentToken = (req: IncomingMessage): string | undefined => {
  const cookies = req.headers?.cookie;
  if (!cookies) return;
  const { token } = parseCookies(cookies);
  if (!token) return;
  if (Array.isArray(token)) return token.pop();
  return token;
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
