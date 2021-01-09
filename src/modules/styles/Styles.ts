import { KeyDataSource } from "core/DataSource";
import { TypedData } from "core/DataSource/types";
import { ErrorResponse } from "core/types";

import { Redis } from "ioredis";
import sass from "sass";

export type StyleData = TypedData & { data: string };
export default class Styles extends KeyDataSource<StyleData> {
  static collectionName = "styles";
  static scopeSet = new Set(["source", "compiled"]);

  encode({ data }) {
    return data;
  }

  parse(data) {
    return { data };
  }

  constructor(protected context: { redis: Redis }) {
    super(context);
    this.context.redis.defineCommand("mergestyles", {
      numberOfKeys: 1,
      lua: `
      local merged = '';
      for i,name in ipairs(ARGV) do
        local style = redis.call('GET','${this.collection}::compiled::'..name);
        if type(style) == 'string'
          then
           merged = merged..style..' ';
        end
       end
       return merged;     
      `,
    });
  }

  /**
   * Save source code and compiled css
   * @param name
   * @param scss
   */
  save(id: string, scss: string): Promise<{ saved: boolean } | ErrorResponse> {
    return Promise.all([
      this.update(id, { data: scss, scope: "source" }),
      this.compiled.save(id, scss),
    ])
      .then((results) => {
        return { saved: Boolean(results[0] && results[1]) };
      })
      .catch((error) => ({
        errors: [{ name: error.name, message: error.message }],
        code: 400,
      }));
  }

  async create({ id, data }: StyleData) {
    const errors = [];
    if (!id) errors.push({ name: "id", message: "ID is required" });
    if (!data) errors.push({ name: "data", message: "Code is required" });
    if (errors.length) return { errors, code: 400 };
    const result = await this.save(id, data);
    if ("errors" in result) return result;
    return { id, data, scope: "compiled" };
  }

  /**
   * Compile sass to css, resolving imported styles
   * @param styles
   */
  async compile(styles: string): Promise<sass.Result> {
    return new Promise((resolve, reject) =>
      sass.render(
        {
          data: styles,
          sourceMap: false,
          outputStyle: "compressed",
          importer: (url, _, done) => {
            this.get(url)
              .then(({ data: contents }) => done({ contents }))
              .catch(done);
          },
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }
      )
    );
  }

  compiled = {
    /**
     * Get compiled css
     * @param name
     */
    get: (name: string) => {
      return this.get(name, "compiled");
    },
    /**
     * Compile and save resulting css in `name`
     * @param name
     * @param scss
     */
    save: (name: string, scss: string) => {
      return this.compile(scss).then((result) =>
        this.update(name, { data: result.css.toString(), scope: "compiled" })
      );
    },
  };

  /**
   * Merge compiled styles together and return resulting css.
   * Styles are merged in the same order as names are.
   * @param names
   */
  merged(names: string[]) {
    return this.context.redis["mergestyles"](this.collection, ...names);
  }
}
