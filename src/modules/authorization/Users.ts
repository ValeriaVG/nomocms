import { HTTPUserInputError } from "core/errors";
import bcrypt, { genSalt } from "bcryptjs";
import Permissions from "./Permissions";
import { ColumnDefinition, SQLDataSource } from "core/sql";
import Tokens from "./Tokens";

export type UserLoginInput = {
  email: string;
  password: string;
};

export type UserInput = {
  name?: string;
  email: string;
  password?: string;
  permissions?: number;
};
export type User = {
  id: number;
  name: string;
  email: string;
  created?: Date;
  updated?: Date;
  pwhash?: never;
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const hashPassword = async (password: string) =>
  bcrypt.hash(password, await genSalt(5));
export default class Users extends SQLDataSource<User, UserInput> {
  collection = "users";

  readonly schema: Record<keyof User, ColumnDefinition> = {
    id: { type: "serial", primaryKey: true },
    name: { type: "varchar", length: 255, nullable: true },
    email: { type: "varchar", length: 255, unique: true },
    created: { type: "timestamp", default: "NOW()" },
    updated: { type: "timestamp", nullable: true },
    pwhash: { type: "text" },
  };

  byEmail(email: string) {
    return this.findOne({ where: { email: normalizeEmail(email) } });
  }

  byToken(token: string): Promise<User> {
    return this.findOne({
      where: { "tokens.id": token },
      join: {
        table:
          ((this.context["tokens"] as Tokens).collection ?? "tokens") +
          " as tokens",
        on: `tokens.user_id=${this.collection}.id AND tokens.expires > NOW()`,
      },
      columns: [`${this.collection}.*`],
    });
  }

  async update(id: number, input: UserInput) {
    return this.save({ id, ...input });
  }

  async create(input: UserInput) {
    if (!input.password)
      throw new HTTPUserInputError("password", "Please provide a password");
    return this.save({ id: false, ...input });
  }

  async save({
    id,
    email,
    password,
    permissions,
    ...input
  }: UserInput & { id: number | false }) {
    const values = { ...input } as UserInput;
    if (email) values.email = normalizeEmail(email);
    if (password) values["pwhash"] = await hashPassword(password);

    const operation = id ? super.update(id, values) : super.create(values);
    return operation
      .then(async (user) => {
        if (!user) return null;
        if (
          typeof permissions !== "undefined" &&
          "permissions" in this.context
        ) {
          await (this.context["permissions"] as Permissions).set({
            user_id: user.id,
            permissions,
          });
        }
        return { ...user, permissions };
      })
      .catch((error) => {
        if (error.message === "already_exists")
          throw new HTTPUserInputError(
            "email",
            "User with this email already exists"
          );
        throw error;
      });
  }

  async login({ email, password }: UserLoginInput) {
    const user = await this.byEmail(email);
    if (!user)
      throw new HTTPUserInputError(
        "email",
        "User with this email does not exist"
      );
    const isCorrect = await bcrypt.compare(password, user.pwhash);
    if (!isCorrect)
      throw new HTTPUserInputError("password", "Wrong email or password");
    return user;
  }
}
