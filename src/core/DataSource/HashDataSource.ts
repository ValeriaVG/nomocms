import { ExcludeReserved } from "core/types";
import { Redis } from "ioredis";
import { SomeDataType } from "./datatypes";
import { CRUDLDataSource } from "./types";
import { collect, decode, encode, flatten } from "./utils";

/**
 * Primary CRUD interface for generic entities
 * stored as Redis hash
 */
export default abstract class HashDataSource<
  T extends ExcludeReserved<T>,
  I = Partial<T>,
  P = Partial<I>
> extends CRUDLDataSource<T, I, P> {
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
    return decode(this.schema, value);
  };

  /**
   * Encodes property values into strings,
   * according to schema
   * @param value
   */
  protected encode = (value: Record<string, any>): Record<string, string> => {
    return encode(this.schema, value);
  };

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
      redis.call('zadd',KEYS[1], 0, id);
      return redis.call('hgetall',cid);
      `,
    });
    context.redis.defineCommand("listhash", {
      numberOfKeys: 1,
      lua: `
      local idx = KEYS[1];
      local count = redis.call('ZCARD', idx);
      local result = redis.call('ZREVRANGEBYSCORE',idx, '+inf', '-inf' , 'LIMIT',ARGV[1],ARGV[2]);
      local items = {};
      for k,cid in ipairs(result) do
        local hash =redis.call('hgetall',cid);
        items[k] = {cid, hash};
      end
      return {count,items};
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
      ...flatten(this.encode(input))
    ).then((result) => {
      return this.decode(collect(result));
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
      ...flatten(this.encode(patch))
    ).then((result) => {
      return this.decode(collect(result));
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
    params: { limit?: number; offset?: number } = {}
  ): Promise<{ items: T[]; nextOffset: number | null; count: number }> {
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    return this.context.redis["listhash"](this.collection, offset, limit).then(
      (result) => {
        const [count, items] = result;
        const next = Number(limit) + Number(offset);
        return {
          items: items.map(([id, item]) => this.decode(collect(item))),
          nextOffset: next >= count ? null : next,
          count,
        };
      }
    );
  }
}
