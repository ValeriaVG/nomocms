import { CRUDLDataSource } from "./types";
import { Redis } from "ioredis";
import { HTTPUserInputError } from "../errors";
import { TypedData } from "./types";
import { ExcludeReserved } from "core/types";

export default abstract class KeyDataSource<
  T extends TypedData
> extends CRUDLDataSource<ExcludeReserved<TypedData>, T> {
  static collectionName: string;
  static scopeSet: Set<string> = new Set();

  get collection() {
    return (this.constructor as typeof KeyDataSource).collectionName;
  }

  get scopes() {
    return (this.constructor as typeof KeyDataSource).scopeSet;
  }

  encode(input): string {
    return JSON.stringify(input);
  }

  decode(input: string) {
    return JSON.parse(input);
  }

  constructor(protected context: { redis: Redis }) {
    super(context);
    this.scopes.add("source");
    if (!this.collection) throw new Error("Collection must be defined");

    this.context.redis.defineCommand("lexlist", {
      numberOfKeys: 2,
      lua: `
      local idx = KEYS[1]..'::'..ARGV[3];
      local count = redis.call('ZCARD', idx);
      local result = redis.call('ZRANGEBYLEX',idx,'['..KEYS[2],'['..KEYS[2]..'\xff','LIMIT',ARGV[1],ARGV[2]);
      local items = {};
      for k,v in ipairs(result) do
        local text =redis.call('get',v);
        items[k] = {v, text};
      end
      return {count,items};
      `,
    });
  }

  /**
   * Check if item exists in this scope
   * @param id
   * @param scope
   */
  async exists(id: string, scope?: string) {
    const validScope = this.validateScope(scope);
    return this.context.redis
      .exists(`${this.collection}::${validScope}::${id}`)
      .then(Boolean);
  }

  /**
   * Get item
   * @param name style name
   */
  async get(id: string, scope?: string) {
    const validScope = this.validateScope(scope);
    const data = await this.context.redis.get(
      `${this.collection}::${validScope}::${id}`
    );
    if (!data) return null;
    return { ...this.decode(data), id, scope };
  }

  /**
   * update
   * @param name
   * @param scss
   */
  async update(id: string, { scope: providedScope, ...input }: Omit<T, "id">) {
    if (!id) throw new HTTPUserInputError("id", "ID is required");
    const scope = this.validateScope(providedScope);

    await this.context.redis
      .multi()
      .set(
        `${this.collection}::${scope ?? "source"}::${id}`,
        this.encode(input)
      )
      .zadd(this.collection + "::" + (scope ?? "source"), "0", id)
      .exec()
      .catch(console.error);

    return { ...input, id, scope } as T;
  }

  /**
   * List items
   * @param params
   */
  list(
    params: {
      limit?: number;
      offset?: number;
      scope?: string;
      search?: string;
    } = {}
  ) {
    const limit = params.limit ?? 10;
    const offset = params.offset ?? "0";
    const scope = this.validateScope(params.scope);
    const search = params.search ?? "";

    return this.context.redis[`lexlist`](
      this.collection,
      search,
      offset,
      limit,
      scope
    ).then((result) => {
      const [count, arr] = result;
      const items = [];
      for (let item of arr) {
        const id = item[0].split("::").pop();
        const data = item[1];
        items.push({ id, scope, ...this.decode(data) });
      }
      const next = Number(offset) + Number(limit);
      const nextOffset = next >= count ? null : next;
      return {
        items,
        nextOffset,
        count,
      };
    });
  }

  /**
   * Delete both source and compiled styles
   * @param name
   */
  delete(name: string) {
    const pipeline = this.context.redis.multi();
    this.scopes.forEach((scope) =>
      pipeline
        .del(this.collection + `::${scope}::` + name)
        .zrem(this.collection + `::${scope}`, name)
    );
    return pipeline.exec().then((results) => {
      const { errored, deleted } = results.reduce(
        (a, c) => {
          a.errored = a.errored || Boolean(c[0]);
          a.deleted += c[1];
          return a;
        },
        { errored: false, deleted: 0 }
      );
      const success = !errored;
      if (errored) {
        console.error(`error:${this.collection}`, results);
      }
      if (deleted !== this.scopes.size * 2) {
        console.warn(`mismatch:${this.collection}`, results);
      }
      return { deleted: success };
    });
  }

  /**
   * Check if type is defined
   * and infer type if none is provided
   * @param type
   */
  protected validateScope(scope: string) {
    if (!scope) return "source";
    if (!this.scopes.has(scope))
      throw new HTTPUserInputError(
        "scope",
        `Incorrect scope for ${this.collection}: "${scope}". Expected: ${[
          ...this.scopes.values(),
        ]
          .map((t) => `"${t}"`)
          .join(", ")}`
      );
    return scope;
  }
}
