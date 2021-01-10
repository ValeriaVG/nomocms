import { RedisDataSource } from "core/DataSource";
import { ContentPage } from "./types";
import matter from "gray-matter";
import marked from "marked";
import querystring from "querystring";
import NormalizedURL from "core/NormalizedURL";
import { html } from "amp/lib";

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
    const errors = [];
    if (!input.template)
      errors.push({
        name: "template",
        message: "Page needs to have a template",
      });
    const values = this.parse(input);
    if (!values.path)
      errors.push({
        name: "path",
        message: "Please define a path",
      });
    const url = new NormalizedURL(values.path);
    const pathExists = await this.context.redis.exists(
      this.collection + "::" + url.normalizedPath
    );
    if (pathExists)
      errors.push({
        name: "path",
        message: "Another page with this path already exists",
      });
    if (errors.length) return { errors, code: 400 };

    return super.create(values);
  }

  parse(input: Partial<ContentPage>) {
    const { data, content } = matter(input.content.trim());
    const html = marked(content);
    const values = { ...data, ...input, content: input.content, html };
    return values;
  }
}
