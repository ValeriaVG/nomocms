import { RouteHandler } from "api/http/router";
import { HTTPStatus } from "lib/HTTPStatus";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { createToken } from "./login";

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
export async function updateAccount() {}
export async function deleteAccount() {}
export async function getAccount() {}
export async function listAccounts() {}
