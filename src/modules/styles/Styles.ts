import { RedisDataSource } from "core/DataSource";

import { Redis } from "ioredis";
import sass from "sass";

export type StyleData = {
  id: string;
  source: string;
  compiled?: string;
};

export default class Styles extends RedisDataSource<StyleData> {
  readonly collection = "styles";

  constructor(protected context: { redis: Redis }) {
    super(context);
  }

  /**
   * Compile and save
   * @param name
   * @param scss
   */

  async update(id: string, { source }): Promise<StyleData> {
    const { css } = await this.compile(source);
    return this.upsert({ id, source, compiled: css?.toString() });
  }

  async create({ id, source }: StyleData) {
    const errors = [];
    if (!source) errors.push({ name: "source", message: "Code is required" });
    const exists = await this.exists(id);
    if (exists)
      errors.push({ name: "id", message: "Style with this ID already exists" });
    if (errors.length) return { errors, code: 400 };
    const result = await this.update(id, { source });
    if (!result) return result;
    return { id, source, compiled: result.compiled };
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
            const getSource = () =>
              this.context.redis
                .hget(this.cid(url), "source")
                .then((contents) => done({ contents }))
                .catch(done);
            // If imported 'template.style'
            if (url.endsWith(".style")) {
              this.context.redis
                .hget("templates::" + url, "style")
                .then((contents) => {
                  if (contents) return done({ contents });
                  getSource();
                })
                .catch(console.error);
            }
            getSource();
          },
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }
      )
    );
  }
}
