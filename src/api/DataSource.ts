import { Redis } from "ioredis";
import { SomeDataType } from "./datatypes";

/**
 * DataSource can be anything from an item
 * stored in Redis to third party service
 */
export abstract class DataSource {
  constructor(protected context: any) {}
}

/**
 * Primary CRUD interface for generic entities
 * stored as Redis hash
 */
export abstract class RedisDataSource<
  T,
  I = Partial<T>,
  P = Partial<I>
> extends DataSource {
  /**
   * Collection will be used as key base:
   * e.g. `items::next`
   */
  readonly collection: string;
  /**
   * Prefix will be used as ID base:
   * e.g. `itm_1`.
   * Item hash will be stored at:
   * `items::itm_1`
   */
  readonly prefix: string;
  /**
   * Schema is used to encode and decode values between strings,
   * as Redis stores everything as text, and JavaScript types
   */
  readonly schema: {
    [key: string]: SomeDataType;
  };

  /**
   * Decode string object properties
   * according to schema
   * @param value
   */
  decode = (value: Record<string, string>): T => {
    if (!value) return null;
    const result: any = { id: value.id };
    for (let key in this.schema) {
      result[key] = this.schema[key].from(value[key]).value;
    }
    return result as T;
  };

  /**
   * Encodes property values into strings,
   * according to schema
   * @param value
   */
  protected encode = (value: Record<string, any>): Record<string, string> => {
    if (!this.schema) throw Error("Schema is required");
    if (!value) throw Error("Value should have properties to be encoded");
    const result: any = {};
    for (let key in value) {
      if (!(key in this.schema)) continue;
      result[key] = new (this.schema[key] as any)(value[key]).toString();
    }
    return result;
  };

  /**
   * Collects [key1,value1, key2, value2,...] array into key-value pairs
   * @param values
   */
  protected collect(values: string[]): Record<string, string> | null {
    if (!values || !values.length) return null;
    const obj = {};
    for (let i = 0; i < values.length; i += 2) {
      const key = values[i];
      const value = values[i + 1];
      obj[key] = value;
    }
    return obj;
  }

  /**
   * Turns key value pairs into flat array
   * [key1, value1, key2, value2, ...]
   * @param input
   */
  protected flatten(input: Record<string, string>) {
    return Object.entries(input).reduce((a, c) => {
      return a.concat(c);
    }, []);
  }

  /**
   * Requires context with Redis
   * @param context
   */
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

  /**
   * Prefixes hash key with collection name
   * @param id
   */
  protected cid(id: string) {
    if (!this.collection) throw new Error("Collection is required");
    return this.collection + "::" + id;
  }

  /**
   * Check if item with provided id exists
   * @param id
   */
  exists(id: string) {
    return this.context.redis.exists(this.cid(id)).then(Boolean);
  }

  /**
   * Retreive item by id
   * @param id
   */
  get(id: string) {
    return this.context.redis.hgetall(this.cid(id)).then((value) => {
      return this.decode(value);
    });
  }

  /**
   * Create new item
   * @param input
   */
  create(input: I) {
    return this.context.redis["newhash"](
      this.collection,
      this.prefix,
      ...this.flatten(this.encode(input))
    ).then((result) => {
      return this.decode(this.collect(result));
    });
  }

  /**
   * Update fields in existing item
   * @param id
   * @param patch
   */
  update(id: string, patch: P) {
    const cid = this.cid(id);
    return this.context.redis["updhash"](
      cid,
      ...this.flatten(this.encode(patch))
    ).then((result) => {
      return this.decode(this.collect(result));
    });
  }

  /**
   * Delete item by id
   * @param id
   */
  delete(id: string) {
    return this.context.redis.del(this.cid(id)).then((deleted) => {
      return { deleted: Boolean(deleted) };
    });
  }

  /**
   * Return list of items, providing `offset` and `limit`.
   * Offset is a cursor, returned during a previous call in `nextOffset`
   * @param params
   */
  list(
    params: { limit?: number; offset?: string } = {}
  ): Promise<{ items: T[]; nextOffset: string }> {
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
