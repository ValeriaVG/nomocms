import { HashDataSource } from "core/DataSource";
import { ContentPage } from "./types";
import matter from "gray-matter";
import marked from "marked";
export default class Pages extends HashDataSource<ContentPage> {
  collection = "pages";
  prefix = "pg";

  decode = (values) => {
    return values;
  };

  encode = (values) => {
    return values;
  };

  create(input: Partial<ContentPage>) {
    // TODO: validate url
    const values = this.parse(input);
    return super.create(values);
  }

  parse(input: Partial<ContentPage>) {
    const { data, content } = matter(input.content.trim());
    const html = marked(content);
    const values = { ...data, ...input, content: input.content, html };
    return values;
  }
}
