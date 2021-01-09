import { KeyDataSource } from "core/DataSource";
import { TemplateData } from "./types";
import { Liquid } from "liquidjs";
import { HTTPUserInputError } from "core/errors";
import Styles from "modules/styles/Styles";
import { APIContext } from "core/types";

export default class Templates extends KeyDataSource<TemplateData> {
  static collectionName = "templates";
  static scopeSet = new Set(["source", "compiled"]);

  constructor(context: APIContext & { styles: Styles }) {
    super(context);
  }

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
        return this.get(id).then((result) => {
          if (!result) return null;
          return result[ext ?? "body"];
        });
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

  decode = (values) => {
    return values;
  };

  encode = (values) => {
    return values;
  };

  static delimiter = "\u0000\u0000\u0000";

  async render(id: string, variables: Record<string, any> = {}) {
    const tpl = await this.get(id);
    if (!tpl) return null;

    const tmp = (tpl.head ?? "") + Templates.delimiter + (tpl.body ?? "");
    return this.renderText(tmp, variables).then((result) => {
      const [head, body] = result.split(Templates.delimiter);
      return { head, body, id, scope: "compiled" };
    });
  }

  async renderText(text: string, variables: Record<string, any> = {}) {
    return this.engine.parseAndRender(text, variables);
  }

  async update(
    id: string,
    { head, body, style }: Partial<Record<"body" | "head" | "style", string>>
  ) {
    try {
      // Parse head and body
      const tmp = (head ?? "") + Templates.delimiter + (body ?? "");
      await this.renderText(tmp);
      // Parse style

      const parsedStyle =
        style && (await (this.context["styles"] as Styles).compile(style));
      const item = {
        id,
        scope: "compiled" as const,
        head,
        body,
        style: parsedStyle?.css.toString(),
      };

      return super.update(id, item);
    } catch (error) {
      throw new HTTPUserInputError(error.name, error.message);
    }
  }
}
