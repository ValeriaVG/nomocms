import { DataSource } from "core/DataSource";
import { Redis } from "ioredis";
import sass from "sass";
export type StyleData = {
  id: string;
  data: string;
};

export default class Styles extends DataSource {
  collection = "styles";

  constructor(protected context: { redis: Redis }) {
    super(context);
    this.context.redis.defineCommand("mergestyles", {
      numberOfKeys: 1,
      lua: `
      local merged = '';
      for i,name in ipairs(ARGV) do
        local style = redis.call('GET',KEYS[1]..'::compiled::'..name);
        if type(style) == 'string'
          then
           merged = merged..style..' ';
        end
       end
       return merged;     
      `,
    });

    this.context.redis.defineCommand("scankeys", {
      numberOfKeys: 2,
      lua: `
      local result = redis.call('scan',ARGV[1],'MATCH',KEYS[1]..'::'..KEYS[2]..'*','COUNT',ARGV[2]);
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
   * Get style source code
   * @param name style name
   */
  get(name: string) {
    return this.context.redis.get(this.collection + "::source::" + name);
  }

  /**
   * Save source code without compiling
   * @param name
   * @param scss
   */
  set(name: string, scss: string) {
    return this.context.redis.set(this.collection + "::source::" + name, scss);
  }

  /**
   * Save source code and compiled css
   * @param name
   * @param scss
   */
  save(name: string, scss: string) {
    return Promise.all([this.save(name, scss), this.compiled.save(name, scss)]);
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
              .then((contents) => done({ contents }))
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
      return this.context.redis.get(this.collection + "::compiled::" + name);
    },
    /**
     * Compile and save resulting css in `name`
     * @param name
     * @param scss
     */
    save: (name: string, scss: string) => {
      return this.compile(scss).then((result) =>
        this.context.redis.set(
          this.collection + "::compiled::" + name,
          result.css.toString()
        )
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

  list(
    params: {
      limit?: number;
      offset?: string;
      type?: "source" | "compiled";
    } = {}
  ): Promise<{ items: { name: string; code: string }[]; nextOffset: string }> {
    const limit = params.limit ?? 10;
    const offset = params.offset ?? "0";
    const type = params.type ?? "source";
    return this.context.redis["scankeys"](
      this.collection,
      type,
      offset,
      limit
    ).then((result) => {
      const [nextOffset, arr] = result;
      const items = [];
      for (let item of arr) {
        const name = item[0].split("::").pop();
        const code = item[1];
        items.push({ name, code });
      }
      return {
        items,
        nextOffset,
      };
    });
  }

  // TODO: delete
}
