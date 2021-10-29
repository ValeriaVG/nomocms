import { RouteHandler } from "api/http/router";
import { HTTPStatus } from "lib/HTTPStatus";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { createToken } from "./login";
import { ensureInt } from "lib/typecast";
import { IncomingMessage } from "http";
import {
  checkPermission,
  ensureAccountPermission,
  ensureLoggedIn,
  Permission,
} from "../permissions";
import { BadRequest, NotFoundError, UnauthorizedError } from "lib/errors";
import { AccountSettings } from "../types";

export const createAccount: RouteHandler<
  { db: Pool },
  { body: { email: string; password: string } }
> = async ({ db }, { body }) => {
  const error = (error: string) => ({
    status: HTTPStatus.BadRequest,
    body: {
      error,
    },
  });
  if (!body.email || !body.password)
    return error("Email and password fields are required");
  const email = body.email.trim().toLowerCase();
  // Check if exists
  const {
    rows: [{ exists }],
  } = await db.query(
    `SELECT count(*)>0 AS exists FROM accounts WHERE email=$1`,
    [email]
  );
  if (exists) return error("Account with this email is already registered");
  // Hash password
  const pwhash = await bcrypt.hash(body.password, 10);
  const id = randomUUID();
  await db.query(`INSERT INTO accounts (id,email,pwhash) VALUES ($1,$2,$3)`, [
    id,
    email,
    pwhash,
  ]);
  const user = { id, email };
  const tokenCookie = await createToken(db, user);
  return {
    status: 201,
    body: { user },
    headers: {
      "Set-Cookie": tokenCookie,
    },
  };
};

export const listAccounts: RouteHandler<
  { db: Pool; req: IncomingMessage },
  { queryParams: URLSearchParams }
> = async ({ db, req }, { queryParams }) => {
  await ensureAccountPermission({ db, req }, "account", Permission.list);
  const params = Object.fromEntries(queryParams.entries());
  const limit = ensureInt(params.limit, 10);
  const { query, cursor } = params;
  const where = [`1=1`];
  const values: any[] = [limit];
  const i = () => values.length;
  if (cursor) {
    values.push(cursor);
    where.push(`id>$${i()}`);
  }
  if (query) {
    values.push(query);
    where.push(`email LIKE $${i()}`);
  }
  const { rows } = await db.query(
    `SELECT id,email,created_at,updated_at FROM accounts WHERE ${where.join(
      " AND "
    )} LIMIT $1`,
    values
  );
  return {
    status: 200,
    body: {
      items: rows,
    },
  };
};

export const getAccount: RouteHandler<
  { db: Pool; req: IncomingMessage },
  { params: { id: string }; body: Partial<AccountSettings> }
> = async ({ db, req }, { params: { id } }) => {
  if (!id) throw BadRequest;
  const user = await ensureLoggedIn({ db, req });
  const canEdit =
    user.id === id ||
    (await checkPermission(db, {
      user,
      scope: "account",
      permission: Permission.read,
    }));
  if (!canEdit) throw UnauthorizedError;

  const result = await db.query(
    `SELECT id,email,created_at, updated_at FROM account WHERE id=$1`,
    [id]
  );
  if (!result.rowCount) throw NotFoundError;
  return {
    status: 200,
    body: {
      user: result.rows[0],
    },
  };
};
export async function updateAccount() {}
export async function deleteAccount() {}
