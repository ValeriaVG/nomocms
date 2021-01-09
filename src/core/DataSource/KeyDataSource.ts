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

  parse(input: string) {
    return JSON.parse(input);
  }

  constructor(protected context: { redis: Redis }) {
    super(context);
    this.scopes.add("source");
    if (!this.collection) throw new Error("Collection must be defined");
    this.context.redis.defineCommand("scan" + this.collection, {
      numberOfKeys: 1,
      lua: `
      local result = redis.call('scan',ARGV[1],'MATCH','${this.collection}::'..KEYS[1]..'*','COUNT',ARGV[2]);
      local keys = result[2];
      local items = {};
      for k,v in ipairs(keys) do
        local text =redis.call('get',v);
        items[k] = {v, text};
      end
      result[2]= items;
      return result    
      `,
    });
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
    return { ...this.parse(data), id, scope };
  }

  /**
   * Create/update
   * @param name
   * @param scss
   */
  async update(id: string, { scope: providedScope, ...input }: Omit<T, "id">) {
    if (!id) throw new HTTPUserInputError("id", "ID is required");
    const scope = this.validateScope(providedScope);
    await this.context.redis.set(
      `${this.collection}::${scope ?? "source"}::${id}`,
      this.encode(input)
    );
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
    } = {}
  ) {
    const limit = params.limit ?? 10;
    const offset = params.offset ?? "0";
    const type = this.validateScope(params.scope);
    return this.context.redis[`scan${this.collection}`](
      type,
      offset,
      limit
    ).then((result) => {
      const [nextOffset, arr] = result;
      const items = [];
      for (let item of arr) {
        const id = item[0].split("::").pop();
        const data = item[1];
        items.push({ id, data, type });
      }
      return {
        items,
        nextOffset,
      };
    });
  }

  /**
   * Delete both source and compiled styles
   * @param name
   */
  delete(name: string) {
    const pipeline = this.context.redis.multi();
    this.scopes.forEach((type) =>
      pipeline.del(this.collection + `::${type}::` + name)
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
      const success = !errored && deleted === this.scopes.size;
      if (errored) {
        console.error(`error:${this.collection}`, results);
      }
      if (deleted !== this.scopes.size) {
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
