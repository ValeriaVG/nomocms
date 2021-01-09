import { CRUDLDataSource } from "./types";
import { Redis } from "ioredis";
import { HTTPUserInputError } from "../errors";
import { TypedData } from "./types";

export default abstract class KeyDataSource<
  T extends TypedData
> extends CRUDLDataSource<T, T> {
  static collectionName: string;
  static typeSet: Set<string> = new Set();

  get collection() {
    return (this.constructor as typeof KeyDataSource).collectionName;
  }

  get types() {
    return (this.constructor as typeof KeyDataSource).typeSet;
  }

  encode(input): string {
    return JSON.stringify(input);
  }

  parse(input: string) {
    return JSON.parse(input);
  }

  constructor(protected context: { redis: Redis }) {
    super(context);
    this.types.add("source");
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
  async get(id: string, type?: string) {
    const validType = this.validateType(type);
    const data = await this.context.redis.get(
      `${this.collection}::${validType}::${id}`
    );
    if (!data) return null;
    return { ...this.parse(data), id, type };
  }

  /**
   * Create/update
   * @param name
   * @param scss
   */
  async update(id: string, { type: providedType, ...input }: Omit<T, "id">) {
    if (!id) throw new HTTPUserInputError("id", "ID is required");
    const type = this.validateType(providedType);
    await this.context.redis.set(
      `${this.collection}::${type ?? "source"}::${id}`,
      this.encode(input)
    );
    return { ...input, id, type } as T;
  }

  /**
   * List items
   * @param params
   */
  list(
    params: {
      limit?: number;
      offset?: number;
      type?: string;
    } = {}
  ) {
    const limit = params.limit ?? 10;
    const offset = params.offset ?? "0";
    const type = this.validateType(params.type);
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
    this.types.forEach((type) =>
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
      const success = !errored && deleted === this.types.size;
      if (errored) {
        console.error(`error:${this.collection}`, results);
      }
      if (deleted !== this.types.size) {
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
  protected validateType(type: string) {
    if (!type) return "source";
    if (!this.types.has(type))
      throw new HTTPUserInputError(
        "type",
        `Incorrect type for ${this.collection}: "${type}". Expected: ${[
          ...this.types.values(),
        ]
          .map((t) => `"${t}"`)
          .join(", ")}`
      );
    return type;
  }
}
