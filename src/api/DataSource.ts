import { Redis } from "ioredis";
import { SomeDataType } from "./datatypes";

export abstract class DataSource {
  constructor(protected context: any) {}
}

export abstract class RedisDataSource<
  T,
  I = Partial<T>,
  P = Partial<I>
> extends DataSource {
  readonly collection: string;
  readonly prefix: string;
  readonly schema: {
    [key: string]: SomeDataType;
  };

  decode = (value: Record<string, string>): T => {
    if (!value) return null;
    const result: any = { id: value.id };
    for (let key in this.schema) {
      result[key] = this.schema[key].from(value[key]).value;
    }
    return result as T;
  };

  encode = (value: Record<string, any>): Record<string, string> => {
    if (!value) throw Error("Value should have properties to be encoded");
    const result: any = {};
    for (let key in value) {
      if (!(key in this.schema)) continue;
      result[key] = new (this.schema[key] as any)(value[key]).toString();
    }
    return result;
  };

  collect(values: string[]) {
    if (!values || !values.length) return null;
    const obj = {};
    for (let i = 0; i < values.length; i += 2) {
      const key = values[i];
      const value = values[i + 1];
      obj[key] = value;
    }
    return obj;
  }

  constructor(protected context: { redis: Redis }) {
    super(context);
    context.redis.defineCommand("updhash", {
      numberOfKeys: 1,
      lua: `
      local exists = redis.call('exists',KEYS[1]);
      local result = nil
      if(exists==1)
        then
          redis.call('hset',KEYS[1], unpack(ARGV));
          result = redis.call('hgetall',KEYS[1]);
      end;
      return result
      `,
    });
    context.redis.defineCommand("newhash", {
      numberOfKeys: 2,
      lua: `
      local next = redis.call('incr',KEYS[1]..'::next');
      local id = KEYS[2]..'_'..next;
      local cid = KEYS[1]..'::'..id;
      redis.call('hset',cid,'id',id, unpack(ARGV));
      return redis.call('hgetall',cid);
      `,
    });
    context.redis.defineCommand("scanhash", {
      numberOfKeys: 2,
      lua: `
      local result = redis.call('scan',ARGV[1],'TYPE','hash','MATCH',KEYS[1]..'::'..KEYS[2]..'_*','COUNT',ARGV[2]);
      local keys = result[2];
      local items = {};
      for k,v in ipairs(keys) do
        items[k]=redis.call('hgetall',v);
      end
      result[2]= items;
      return result
      `,
    });
  }

  cid(id: string) {
    return this.collection + "::" + id;
  }
  exists(id: string) {
    return this.context.redis.exists(this.cid(id));
  }

  get(id: string) {
    return this.context.redis.hgetall(this.cid(id)).then((value) => {
      return this.decode(value);
    });
  }
  create(input: I) {
    const values = Object.entries(this.encode(input)).reduce((a, c) => {
      return a.concat(c);
    }, []);
    return this.context.redis["newhash"](
      this.collection,
      this.prefix,
      ...values
    ).then((result) => {
      return this.decode(this.collect(result));
    });
  }

  update(id: string, patch: P) {
    const values = Object.entries(this.encode(patch)).reduce((a, c) => {
      return a.concat(c);
    }, []);
    const cid = this.cid(id);
    return this.context.redis["updhash"](cid, ...values).then((result) => {
      return this.decode(this.collect(result));
    });
  }
  delete(id: string) {
    return this.context.redis.del(this.cid(id)).then((deleted) => {
      return { deleted: Boolean(deleted) };
    });
  }
  list(params: { limit?: number; offset?: string } = {}) {
    const limit = params.limit ?? 10;
    const offset = params.offset ?? "0";
    return this.context.redis["scanhash"](
      this.collection,
      this.prefix,
      offset,
      limit
    ).then((result) => {
      const [nextOffset, items] = result;
      return {
        items: items.map((item) => this.decode(this.collect(item))),
        nextOffset,
      };
    });
  }
}
