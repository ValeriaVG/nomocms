import * as T from "typed";
import { superuser } from "api/config";
import bcrypt from "bcryptjs";
import isEmail from "is-email";
import { Pool } from "pg";
import { AccountSettings, User } from "../types";
import { ValidationError } from "lib/validation";

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

export const credentialsType = T.object({
  email: emailType,
  password: passwordType,
});

export const SuperUser = {
  id: "superuser",
  email: superuser.email,
  isSuperUser: true,
};

export const ensureCredentials = (credentials: any) => {
  const validation = credentialsType(credentials);
  if (validation.success === false)
    throw new ValidationError(validation.errors);
  return validation.value;
};

export const getUserByCredentials = async (
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
