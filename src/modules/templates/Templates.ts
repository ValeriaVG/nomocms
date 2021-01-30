import { SQLDataSource } from "core/DataSource";
import { TemplateData } from "./types";
import { Liquid } from "liquidjs";
import { HTTPUserInputError } from "core/errors";
import Styles from "modules/styles/Styles";
import { ColumnDefinition } from "core/sql";

export default class Templates extends SQLDataSource<TemplateData> {
  readonly collection = "templates";

  readonly schema: Record<keyof TemplateData, ColumnDefinition> = {
    id: { type: "varchar", length: 50, primaryKey: true },
    body: { type: "text", nullable: true },
    style: { type: "text", nullable: true },
    head: { type: "text", nullable: true },
    compiled: { type: "text", nullable: true },
  };

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
        return this.get(id, (ext || "body") as any) as Promise<string>;
      },
      exists: async (file) => {
        return this.exists({ id: file.split(".").shift() });
      },
      resolve(root, file, ext) {
        if (ext === "style") return null;
        return `${file}.${ext ?? "body"}`;
      },
    },
  });

  static delimiter = "\u0000\u0000\u0000";

  async render(id: string, variables: Record<string, any> = {}) {
    const tpl = (await this.get(id)) as TemplateData;
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

  async create(input: TemplateData) {
    const errors = [];
    if (!input.id) errors.push({ name: "id", message: "ID is required" });
    const { style } = await this.preview(input);
    return super.create({ ...input, compiled: style });
  }

  async update(id: string, input: Omit<Partial<TemplateData>, "id">) {
    const { style } = await this.preview(input);
    delete input["id"];
    return super.update(id, { ...input, compiled: style });
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
