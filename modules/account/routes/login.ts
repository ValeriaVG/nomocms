import { superuser } from "api/config";
import { RouteHandler } from "api/http/router";
import { HTTPStatus } from "lib/HTTPStatus";
import { Pool } from "pg";

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
  if (
    superuser.email &&
    email.trim().toLowerCase() === superuser.email &&
    superuser.password === password
  ) {
    return {
      status: 201,
      body: {
        id: "superuser",
        email: superuser.email,
      },
    };
  }
  const result = await db.query(`select * from accounts where email=$1`, [
    email.trim().toLowerCase(),
  ]);
  if (!result.rowCount) return error;
  const { pwhash, ...user } = result.rows[0];
  //FIXME: bcrypt
  return { status: 200, body: { user } };
};
export function logout() {}
export function getCurrentAccount() {}
