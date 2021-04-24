import { ColumnDefinition, SQLDataSource } from "core/sql";
import { ErrorResponse } from "core/types";
import Templates from "modules/templates/Templates";
import sass from "sass";

export type StyleData = {
  id: string;
  source: string;
  compiled?: string;
};

export default class Styles extends SQLDataSource<StyleData> {
  readonly collection = "styles";

  readonly schema: Record<keyof StyleData, ColumnDefinition> = {
    id: { type: "varchar", length: 50, primaryKey: true },
    source: { type: "text" },
    compiled: { type: "text", nullable: true },
  };

  /**
   * Compile and save
   * @param name
   * @param scss
   */

  async update(id: string, { source }): Promise<StyleData | ErrorResponse> {
    try {
      const { css } = await this.compile(source);
      return this.upsert({ id, source, compiled: css?.toString() });
    } catch (error) {
      return {
        errors: [{ name: error.name, message: error.message }],
        code: 400,
      };
    }
  }

  async create({ id, source }: StyleData) {
    const errors = [];
    if (!source) errors.push({ name: "source", message: "Code is required" });
    const exists = await this.exists({ id });
    if (exists)
      errors.push({ name: "id", message: "Style with this ID already exists" });
    if (errors.length) return { errors, code: 400 };
    const result = await this.update(id, { source });
    if (!result || "errors" in result) return result;
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
              this.get(url, "source")
                .then((contents: string) => done({ contents }))
                .catch(done);
            // If imported 'template.style'
            if (url.endsWith(".style")) {
              (this.context.templates as Templates)
                .get(url, "style")
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
