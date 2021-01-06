import { DataSource } from "core/DataSource";
import { Redis } from "ioredis";
import sass from "sass";
export type StyleData = {
  id: string;
  data: string;
};

export default class Styles extends DataSource {
  collection = "styles";
  prefix = "sty";

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
}
