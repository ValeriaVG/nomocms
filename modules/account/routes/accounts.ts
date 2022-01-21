import { RouteHandler } from "api/http/router";
import { HTTPStatus } from "lib/HTTPStatus";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { ensureInt } from "lib/typecast";
import {
  checkPermission,
  ensureAccountPermission,
  ensureLoggedIn,
  ensureSelfOrAllowed,
  Permission,
} from "../lib/permissions";
import { NotFoundError, UnauthorizedError } from "lib/errors";
import { emailType, ensureCredentials, passwordType } from "../lib/credentials";
import { createToken } from "../lib/token";
import { ValidationError } from "lib/validation";
import * as T from "lib/typed";

export const createAccount: RouteHandler = async ({ db }, { body }) => {
  const error = (error: string) => ({
    status: HTTPStatus.BadRequest,
    body: {
      error,
    },
  });
  const { email, password } = ensureCredentials(body);
  // Check if exists
  const {
    rows: [{ exists }],
  } = await db.query(
    `SELECT count(*)>0 AS exists FROM accounts WHERE email=$1`,
    [email]
  );
  if (exists) return error("Account with this email is already registered");
  // Hash password
  const pwhash = await bcrypt.hash(password, 10);
  const id = randomUUID();
  const { rows } = await db.query(
    `INSERT INTO accounts (id,email,pwhash) VALUES ($1,$2,$3) RETURNING id,email,created_at,updated_at`,
    [id, email, pwhash]
  );
  const user = rows[0];
  const tokenCookie = await createToken(db, user);
  return {
    status: 201,
    body: { user },
    headers: {
      "Set-Cookie": tokenCookie,
    },
  };
};

export const listAccounts: RouteHandler = async (
  { db, req },
  { queryParams }
) => {
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

export const getAccount: RouteHandler = async (
  { db, req },
  { params: { id } }
) => {
  const user = await ensureSelfOrAllowed({ db, req }, id, Permission.read);
  const result = await db.query(
    `SELECT id,email,created_at, updated_at FROM account WHERE id=$1`,
    [user.id]
  );
  if (!result.rowCount) throw NotFoundError;
  return {
    status: 200,
    body: {
      user: result.rows[0],
    },
  };
};

const accountType = T.object({
  email: emailType,
  password: T.optional(passwordType),
});

export const updateAccount: RouteHandler = async (
  { db, req },
  { queryParams, body }
) => {
  const user = await ensureLoggedIn({ db, req });
  const id = queryParams.get("id") || user.id;
  const canEdit =
    user.id === id ||
    (await checkPermission(db, {
      user,
      scope: "account",
      permission: Permission.update,
    }));
  if (!canEdit) throw UnauthorizedError;

  const validation = accountType(body);
  if (validation.success === false)
    throw new ValidationError(validation.errors);
  const { email, password } = validation.value;
  const update: Partial<{ email: string; pwhash: string }> = {
    email,
  };
  if (password) update.pwhash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    `UPDATE accounts SET ${Object.keys(update)
      .map((key, i) => `${key}=$${i + 2}`)
      .join(
        ","
      )},updated_at=NOW() WHERE id=$1 RETURNING id,email,updated_at,created_at`,
    [id, ...Object.values(update)]
  );
  return { status: 200, body: { user: rows[0] } };
};
export const deleteAccount: RouteHandler = async (
  { db, req },
  { queryParams }
) => {
  const user = await ensureSelfOrAllowed(
    { db, req },
    queryParams.get("id"),
    Permission.delete
  );
  await db.query(`DELETE FROM accounts WHERE id=$1`, [user.id]);
  return {
    status: 200,
    body: {
      message: "Account was deleted",
    },
  };
};
