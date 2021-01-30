import {
  collect,
  flatten,
  RedisDataSource,
  TInt,
  TString,
} from "core/DataSource";
import { HTTPUserInputError } from "core/errors";
import bcrypt, { genSalt } from "bcryptjs";
import Permissions from "./Permissions";
import { superuser } from "config";

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
      numberOfKeys: 2,
      lua: `
      local tokenidx = 'tokens::'..KEYS[2]
      local id = redis.call('GET', tokenidx);
      if id == 'superuser'
        then
          return id
      end    
      if type(id) == 'string'
        then
          local cid = KEYS[1]..'::'..id;
          return redis.call('hgetall',cid);
      end
      return id  
      `,
    });

    /**
     * collection
     * id
     */
    context.redis.defineCommand("saveuser", {
      numberOfKeys: 2,
      lua: `
      local cid = KEYS[1]..'::'..KEYS[2];
      redis.call('hset',cid,unpack(ARGV));
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
          redis.call('zadd',KEYS[1],0,id);
          return redis.call('hgetall',cid);
        else
          return {err="already_exists"}  
      end  
      `,
    });

    context.redis.defineCommand("remuser", {
      numberOfKeys: 2,
      lua: `
      redis.call('zrem',KEYS[1],KEYS[2]);
      local email = redis.call('hget',KEYS[1]..'::'..KEYS[2],'email');
      if email == nil
      then
        return 0
      end  
      redis.call('zrem',KEYS[1]..'::email',email..'::'..KEYS[2])
      return redis.call('del',KEYS[1]..'::'..KEYS[2]);
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
        if (result === "superuser")
          return { email: superuser.email, id: "superuser" };
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

  delete = (id: string) => {
    return this.context.redis["remuser"](this.collection, id).then((r) => ({
      deleted: Boolean(r),
    }));
  };

  async save({
    email,
    password,
    permissions,
    ...input
  }: UserInput & { id: string | false }) {
    const pwhash = password && (await bcrypt.hash(password, await genSalt(5)));

    const newEmail = email.trim().toLowerCase();

    const operation =
      input.id === false
        ? this.context.redis["newuser"](
            this.collection,
            this.prefix,
            newEmail,
            ...flatten(this.encode(input)),
            ...(pwhash ? ["pwhash", pwhash] : []),
            "createdAt",
            Date.now()
          )
        : this.context.redis["saveuser"](
            this.collection,
            input.id,
            ...flatten(this.encode(input)),
            ...(pwhash ? ["pwhash", pwhash] : []),
            "updatedAt",
            Date.now()
          );

    return operation
      .then(async (result) => {
        const user = await this.decode(collect(result));
        if (!user) return null;
        if (typeof permissions !== undefined && "permissions" in this.context) {
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
