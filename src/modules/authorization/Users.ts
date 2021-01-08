import { collect, flatten, RedisDataSource } from "core/DataSource";
import { TInt, TString } from "core/datatypes";
import { HTTPUserInputError } from "core/errors";
import bcrypt, { genSalt } from "bcryptjs";

export type UserLoginInput = {
  email: string;
  password: string;
};

export type UserInput = { name?: string; email: string; password?: string };
export type User = {
  id: string;
  name: string;
  email: string;
  createdAt?: number;
  updatedAt?: number;
};
export default class Users extends RedisDataSource<User, UserInput> {
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
      numberOfKeys: 3,
      lua: `
      local tokenidx = KEYS[1]..'::token'
      local tokens = redis.call('ZRANGEBYLEX', tokenidx, '['..KEYS[3], '['..KEYS[3]..':\xff');
      local i = next(tokens)
      if i == nil
        then
          return nil;
      end
      local token = tokens[i];
      local id = string.gsub(token,'(.+)::(.+)','%2');
      local cid = KEYS[1]..'::'..id;
      return redis.call('hgetall',cid);
      `,
    });

    context.redis.defineCommand("newuser", {
      numberOfKeys: 3,
      lua: `
      local emailidx = KEYS[1]..'::email'
      local emails = redis.call('ZLEXCOUNT', emailidx, '['..KEYS[3], '['..KEYS[3]..':\xff');
      if emails == 0 
        then
          local next = redis.call('incr',KEYS[1]..'::next');
          local id = KEYS[2]..'_'..next;
          local cid = KEYS[1]..'::'..id;
          redis.call('hset',cid,'id',id, 'email', KEYS[3], unpack(ARGV));
          redis.call('zadd',emailidx,0,KEYS[3]..'::'..id);
          return redis.call('hgetall',cid);
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
    return this.context.redis["userbytoken"](
      this.collection,
      this.prefix,
      token
    ).then((result) => {
      return this.decode(collect(result));
    });
  }

  saveToken(id: string, token: string) {
    return this.context.redis.zadd(
      `${this.collection}::token`,
      0,
      token + "::" + id
    );
  }

  async create({ email, password, ...rest }: UserInput) {
    if (!password)
      throw new HTTPUserInputError("password", "Please provide a password");
    const pwhash = await bcrypt.hash(password, await genSalt(5));
    // prevent forced id
    delete rest["id"];
    rest["createdAt"] = Date.now();
    const input = { ...rest, email: email.trim().toLowerCase() };
    return this.context.redis["newuser"](
      this.collection,
      this.prefix,
      input.email,
      ...flatten(this.encode(input)),
      "pwhash",
      pwhash
    )
      .then((result) => {
        return this.decode(collect(result));
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
