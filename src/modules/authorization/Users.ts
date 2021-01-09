import {
  collect,
  flatten,
  HashDataSource,
  TInt,
  TString,
} from "core/DataSource";
import { HTTPUserInputError } from "core/errors";
import bcrypt, { genSalt } from "bcryptjs";
import Permissions from "./Permissions";

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
  id: string;
  name: string;
  email: string;
  createdAt?: number;
  updatedAt?: number;
};
export default class Users extends HashDataSource<User, UserInput> {
  collection = "users";
  prefix = "usr";
  schema = {
    name: TString,
    email: TString,
    createdAt: TInt,
    updatedAt: TInt,
    activeAt: TInt,
  };

  constructor(context) {
    super(context);

    context.redis.defineCommand("userbyemail", {
      numberOfKeys: 3,
      lua: `
      local emailidx = KEYS[1]..'::email'
      local emails = redis.call('ZRANGEBYLEX', emailidx, '['..KEYS[3], '['..KEYS[3]..':\xff');
      local i = next(emails);
      if i == nil
        then
          return nil;  
        else
          local email = emails[i];
          local id = string.gsub(email,'(.+)::(.+)','%2');
          local cid = KEYS[1]..'::'..id;
          return redis.call('hgetall',cid);
      end  
      `,
    });
    context.redis.defineCommand("userbytoken", {
      numberOfKeys: 2,
      lua: `
      local tokenidx = 'tokens::'..KEYS[2]
      local id = redis.call('GET', tokenidx);
      if type(id) == 'string'
        then
          local cid = KEYS[1]..'::'..id;
          return redis.call('hgetall',cid);
      end
      return id  
      `,
    });

    const saveuser = [
      "local next = redis.call('incr',KEYS[1]..'::next');",
      "local id = KEYS[2]..'_'..next;",
      "local cid = KEYS[1]..'::'..id;",
      "redis.call('hset',cid,'id',id, 'email', KEYS[3], unpack(ARGV));",
      "redis.call('zadd',emailidx,0,KEYS[3]..'::'..id);",
      "return redis.call('hgetall',cid);",
    ].join("\n");
    context.redis.defineCommand("saveuser", {
      numberOfKeys: 3,
      lua: saveuser,
    });
    context.redis.defineCommand("newuser", {
      numberOfKeys: 3,
      lua: `
      local emailidx = KEYS[1]..'::email'
      local emails = redis.call('ZLEXCOUNT', emailidx, '['..KEYS[3], '['..KEYS[3]..':\xff');
      if emails == 0 
        then
          ${saveuser}
        else
          return {err="already_exists"}  
      end  
      `,
    });
  }

  byEmail(email: string, decode: boolean = true) {
    const normalizedEmail = email.trim().toLowerCase();
    return this.context.redis["userbyemail"](
      this.collection,
      this.prefix,
      normalizedEmail
    ).then((result) => {
      const user = collect(result);
      if (!decode) return user;
      return this.decode(user);
    });
  }

  byToken(token: string): Promise<User> {
    return this.context.redis["userbytoken"](this.collection, token).then(
      (result) => {
        return this.decode(collect(result));
      }
    );
  }

  async update(id: string, input: UserInput) {
    return this.save({ id, ...input });
  }

  async create(input: UserInput) {
    if (!input.password)
      throw new HTTPUserInputError("password", "Please provide a password");
    input["createdAt"] = Date.now();
    return this.save({ ...input, id: false });
  }

  async save({
    email,
    password,
    permissions,
    ...rest
  }: UserInput & { id: string | false }) {
    const pwhash = password && (await bcrypt.hash(password, await genSalt(5)));

    const input = { ...rest, email: email.trim().toLowerCase() };
    return this.context.redis[input.id ? "saveuser" : "newuser"](
      this.collection,
      this.prefix,
      input.email,
      ...flatten(this.encode(input)),
      ...(pwhash ? ["pwhash", pwhash] : [])
    )
      .then(async (result) => {
        const user = await this.decode(collect(result));
        if (!user) return null;
        if (typeof permissions !== undefined && "permissions" in this.context) {
          await (this.context["permissions"] as Permissions).set({
            user: user.id,
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
    const user = await this.byEmail(email, false);
    if (!user)
      throw new HTTPUserInputError(
        "email",
        "User with this email does not exist"
      );
    const isCorrect = await bcrypt.compare(password, user.pwhash);
    if (!isCorrect)
      throw new HTTPUserInputError("password", "Wrong email or password");
    return this.decode(user);
  }
}
