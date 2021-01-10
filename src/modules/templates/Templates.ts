import { RedisDataSource } from "core/DataSource";
import { TemplateData } from "./types";
import { Liquid } from "liquidjs";
import { HTTPUserInputError } from "core/errors";
import Styles from "modules/styles/Styles";

export default class Templates extends RedisDataSource<TemplateData> {
  collection = "templates";

  private engine = new Liquid({
    outputDelimiterLeft: "<%",
    outputDelimiterRight: "%>",
    tagDelimiterLeft: "{%",
    tagDelimiterRight: "%}",

    fs: {
      readFileSync: undefined,
      existsSync: undefined,

      readFile: async (file) => {
        const [id, ext] = file.split(".");
        return this.context.redis.hget(this.cid(id), ext ?? "body");
      },
      exists: async (file) => {
        return this.exists(file.split(".").shift());
      },
      resolve(root, file, ext) {
        if (ext === "style") return null;
        return `${file}.${ext ?? "body"}`;
      },
    },
  });

  static delimiter = "\u0000\u0000\u0000";

  async render(id: string, variables: Record<string, any> = {}) {
    const tpl = await this.get(id);
    if (!tpl) return null;
    const tmp = (tpl.head ?? "") + Templates.delimiter + (tpl.body ?? "");
    return this.renderText(tmp, variables).then((result) => {
      const [head, body] = result.split(Templates.delimiter);
      return { head, body, id, style: tpl.compiled };
    });
  }

  async renderText(text: string, variables: Record<string, any> = {}) {
    return this.engine.parseAndRender(text, variables);
  }

  async create({ id, ...data }: TemplateData) {
    const errors = [];
    if (!id) errors.push({ name: "id", message: "ID is required" });

    const exists = await this.exists(id);
    if (exists)
      errors.push({
        name: "id",
        message: "Template with this ID already exists",
      });
    if (errors.length) return { errors, code: 400 };

    return this.update(id, data);
  }

  async update(
    id: string,
    input: Partial<Record<"body" | "head" | "style", string>>
  ) {
    const { style } = await this.preview(input);
    return this.upsert({ id, ...input, compiled: style });
  }

  async get(id: string) {
    const template = await super.get(id);
    if (!template) return template;
    return template;
  }
  preview = async (
    { head, body, style }: Partial<Record<"body" | "head" | "style", string>>,
    params?: { content: string; [key: string]: any }
  ) => {
    try {
      // Parse head and body
      let tmp = (head ?? "") + Templates.delimiter + (body ?? "");

      const result = await this.renderText(tmp, params);
      const [renderedHead, renderedBody] = result.split(Templates.delimiter);
      // Parse style
      const parsedStyle =
        style && (await (this.context["styles"] as Styles).compile(style));
      const item = {
        id: "preview",
        scope: "compiled" as const,
        head: renderedHead,
        body: renderedBody,
        style: parsedStyle?.css?.toString() ?? "",
      };

      return item;
    } catch (error) {
      throw new HTTPUserInputError(error.name, error.message);
    }
  };
}
