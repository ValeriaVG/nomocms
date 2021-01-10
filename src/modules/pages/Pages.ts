import { flatten, RedisDataSource } from "core/DataSource";
import { ContentPage } from "./types";
import matter from "gray-matter";
import marked from "marked";
import querystring from "querystring";
import NormalizedURL from "core/NormalizedURL";
import { html } from "amp/lib";
import Templates from "modules/templates/Templates";
import { HTTPUserInputError } from "core/errors";
import { ErrorResponse } from "core/types";

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
export default class Pages extends RedisDataSource<ContentPage> {
  collection = "pages";
  prefix = "pg";

  async create(input: Partial<ContentPage>) {
    if (!input.template)
      throw new HTTPUserInputError("template", "Page needs to have a template");
    const values = this.parse(input);
    if ("errors" in values) return values;
    const pathExists = await this.context.redis.exists(
      this.pageKey(values.path)
    );
    if (pathExists)
      throw new HTTPUserInputError(
        "path",
        "Another page with this path already exists"
      );
    await this.validateAndSave(values);
    return super.create(values);
  }

  async update(id, input: Partial<ContentPage>) {
    const values = this.parse(input);
    if ("errors" in values) return values;
    await this.validateAndSave(values);
    return super.update(id, values);
  }

  pageKey(path: string) {
    if (path === "*" || path === "/*")
      return this.collection + "::url::wildcard";
    return this.collection + "::url::" + new NormalizedURL(path).normalizedPath;
  }
  async validateAndSave(input: Partial<ContentPage> & { html: string }) {
    if (!input.path)
      throw new HTTPUserInputError("path", "Please defined a path");
    const templates = this.context["templates"] as Templates;
    if (!input.template || !(await templates.exists(input.template)))
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
    await this.context.redis.hset(this.pageKey(input.path), ...flatten(result));
  }

  parse(
    input: Partial<ContentPage>
  ): (Partial<ContentPage> & { html: string }) | ErrorResponse {
    try {
      const { data, content } = matter(input.content.trim());
      const html = marked(content);
      const values = { ...data, ...input, content: input.content, html };
      return values;
    } catch (error) {
      return {
        errors: [{ name: "content", message: error.message }],
        code: 400,
      };
    }
  }

  async delete(id: string) {
    const path = await this.context.redis.hget(this.cid(id), "path");
    await this.context.redis.del(this.pageKey(path));
    return super.delete(id);
  }
}
