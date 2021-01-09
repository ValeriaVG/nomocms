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

  create(input) {
    const { data, content } = matter(input.content.trim());
    const html = marked(content);
    const values = { ...data, ...input, content, html };
    return super.create(values);
  }
}
