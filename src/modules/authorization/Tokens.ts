import { DataSource } from "core/DataSource";
import { Redis } from "ioredis";

export default class Tokens extends DataSource {
  readonly collection = "tokens";
  readonly ttl = 30 * 24 * 60 * 60; // 30 days

  constructor(protected context: { redis: Redis }) {
    super(context);
    this.context.redis.defineCommand("remtokens", {
      numberOfKeys: 2,
      lua: `
      local tokenidx = KEYS[1]..'::'..KEYS[2];
      local tokens = redis.call('ZRANGE', tokenidx, 0, -1);
      local count = 0;
      for k,v in pairs(tokens) do
        local token = string.gsub(v,'(.+)::(.*)','%1');
        local deleted = redis.call('DEL',KEYS[1]..'::'..token);
        count = count + deleted;
      end
      redis.call('DEL', tokenidx);
      return count
      `,
    });
  }

  /**
   * Save token for user with `id` and `ip`
   * @param input
   */
  save({ token, id, ip }: { token: string; id: string; ip?: number }) {
    return this.context.redis
      .multi()
      .set(this.collection + "::" + token, id, "EX", this.ttl)
      .zadd(
        this.collection + "::" + id,
        Date.now().toString(),
        `${token}::${ip}`
      )
      .exec()
      .then((results) => {
        return results[1][1];
      });
  }

  /**
   * Get user id by token
   * @param token
   */
  get(token: string): Promise<string> {
    return this.context.redis.get(this.collection + "::" + token);
  }
  /**
   * List all tokens, that belongs to user with provided `id`
   * @param id
   */
  list(
    id: string
  ): Promise<Array<{ ip?: number; createdAt: number; token: string }>> {
    return this.context.redis
      .zrange(this.collection + "::" + id, 0, -1, "WITHSCORES")
      .then((results) => {
        const entries = [];
        for (let i = 0; i < results.length; i += 2) {
          const [token, ip] = results[i].split("::");
          const createdAt = parseInt(results[i + 1]);
          entries.push({
            token,
            createdAt,
            ip: parseInt(ip),
          });
        }
        return entries;
      });
  }

  /**
   * Delete provided token for user, a.k.a. logout
   * @param token
   */
  delete({ token, id }: { token: string; id: string }) {
    return this.context.redis
      .multi()
      .del(this.collection + "::" + token)
      .zremrangebylex(
        this.collection + "::" + id,
        `[${token}:`,
        `[${token}::\uffff`
      )
      .exec()
      .then((results) =>
        results.reduce((a, c) => {
          return a & c[1];
        }, 1)
      );
  }

  /**
   * Delete all tokens from user, a.k.a logout from all devices
   * @param id
   */
  deleteAll(id: string) {
    return this.context.redis["remtokens"](this.collection, id);
  }
}
