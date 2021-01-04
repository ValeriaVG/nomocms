import { RedisDataSource } from "api/DataSource";
import { TBoolean, TString } from "api/datatypes";
import { HTTPUserInputError } from "api/errors";
import bcrypt, { genSalt } from "bcryptjs";

export type UserLoginInput = {
  email: string;
  password: string;
};

export default class Users extends RedisDataSource<
  {
    id: string;
    name: string;
    email: string;
    pwhash: string;
    isAdmin?: boolean;
  },
  UserLoginInput
> {
  collection = "users";
  prefix = "usr";
  schema = {
    name: TString,
    email: TString,
    isAdmin: TBoolean,
  };

  constructor(context) {
    super(context);
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
    context.redis.defineCommand("userbyemail", {
      numberOfKeys: 3,
      lua: `
      local emailidx = KEYS[1]..'::email'
      local emails = redis.call('ZRANGEBYLEX', emailidx, '['..KEYS[3], '['..KEYS[3]..':\xff');
      local i = next(emails);
      if i == nil
        then
          return {err="not_found"}  
        else
          local email = emails[i];
          local id = string.gsub(email,KEYS[3]..'::','');
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
      local i = next(tokens);
      if i == nil
        then
          return {err="not_found"}  
        else
          local token = tokens[i];
          local id = string.gsub(token,KEYS[3]..'::','');
          local cid = KEYS[1]..'::'..id;
          return redis.call('hgetall',cid);
      end  
      `,
    });
  }

  async create({ email, password, ...rest }: UserLoginInput) {
    const pwhash = await bcrypt.hash(password, await genSalt(5));
    delete rest["id"];
    const input = { ...rest, email: email.trim().toLowerCase() };
    return this.context.redis["newuser"](
      this.collection,
      this.prefix,
      input.email,
      ...this.flatten(this.encode(input)),
      "pwhash",
      pwhash
    )
      .then((result) => {
        return this.decode(this.collect(result));
      })
      .catch((error) => {
        if (error.name === "already_exists")
          throw new HTTPUserInputError("email", error.message);
        throw error;
      });
  }

  login({ email, password }: UserLoginInput) {
    const input = { email: email.trim().toLowerCase(), password };
    return this.context.redis["userbyemail"](
      this.collection,
      this.prefix,
      email,
      ...this.flatten(this.encode(input))
    )
      .then(async (result) => {
        const user = this.collect(result);
        if (!user) return null;
        const isCorrect = await bcrypt.compare(password, user.pwhash);
        if (!isCorrect)
          throw new HTTPUserInputError("password", "Wrong email or password");
        return this.decode(user);
      })
      .catch((error) => {
        if (error.message === "not_found")
          throw new HTTPUserInputError(
            "email",
            "User with this email does not exist"
          );
        throw error;
      });
  }

  byToken(token: string) {
    return this.context.redis["userbytoken"](
      this.collection,
      this.prefix,
      token
    )
      .then((result) => {
        return this.decode(this.collect(result));
      })
      .catch((error) => {
        if (error.message === "not_found") return null;
        throw error;
      });
  }

  saveToken(id: string, token: string) {
    return this.context.redis.zadd(
      `${this.collection}::token`,
      0,
      token + "::" + id
    );
  }
}
