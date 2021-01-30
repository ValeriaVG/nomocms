import { SQLDataSource } from "core/DataSource";
import { ContentPage } from "./types";
import matter from "gray-matter";
import marked from "marked";
import querystring from "querystring";
import { html } from "amp/lib";
import Templates from "modules/templates/Templates";
import { HTTPUserInputError } from "core/errors";
import { ColumnDefinition } from "core/sql";

const renderer = {
  image(href: string, caption: string, text: string) {
    const [url, query] = href.split("?");
    const params = query ? querystring.parse(query.replace("__", " ")) : {};
    delete params["alt"];
    delete params["src"];
    const image = html`<amp-img
      alt="${text}"
      ${params2props(params)}
      src="${url}"
    ></amp-img>`;
    if (!caption) return image;
    return html`<figure>
      ${image}
      <figcaption>${caption}</figcaption>
    </figure>`;
  },
};

function params2props(params: Record<string, string | string[]>) {
  return Object.keys(params)
    .map((key) => {
      const value = params[key];
      if (Array.isArray(value)) return `${key}="${value.join(",")}"`;
      return `${key}="${params[key]}"`;
    })
    .join(" ");
}
marked.use({ renderer });

export default class Pages extends SQLDataSource<ContentPage> {
  readonly collection = "pages";

  readonly schema: Record<string, ColumnDefinition> = {
    id: { type: "serial", primaryKey: true },
    path: { type: "varchar", length: 255 },
    template: { type: "varchar", length: 50 },
    title: { type: "varchar", length: 255 },
    description: { type: "text", nullable: true },
    content: { type: "text" },
    html: { type: "text" },
    created: { type: "timestamp", default: "NOW()" },
    updated: { type: "timestamp", nullable: true },
    published: { type: "timestamp", nullable: true },
    code: { type: "int", nullable: true },
  };

  async render(input: Partial<ContentPage> & { html: string }) {
    if (!input.path)
      throw new HTTPUserInputError("path", "Please defined a path");
    const templates = this.context["templates"] as Templates;
    if (!input.template)
      throw new HTTPUserInputError(
        "template",
        "Please choose a template for this page"
      );
    // Render page into url
    const result = await templates.render(input.template, {
      ...input,
      content: input.html,
    });
    if (input["code"]) {
      result["code"] = (input["code"] as number).toString();
    }
    return result;
  }

  parse(input: Partial<ContentPage>): Partial<ContentPage> {
    try {
      const { data, content } = matter(input.content.trim());
      const html = marked(content);
      const values = { ...data, ...input, content: input.content, html };
      return values;
    } catch (error) {
      throw new HTTPUserInputError("content", error.message);
    }
  }

  async create(input: Partial<ContentPage> & { content: string }) {
    return super.create(this.parse(input));
  }
  async update(id: number, input: Partial<ContentPage> & { content: string }) {
    return super.update(id, this.parse(input));
  }
}
