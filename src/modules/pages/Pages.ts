import { ContentPage, ContentPageInput } from "./types";
import matter from "gray-matter";
import marked from "marked";
import querystring from "querystring";
import { html } from "amp/lib";
import Templates from "modules/templates/Templates";
import { HTTPUserInputError } from "core/errors";
import { ColumnDefinition, sql, SQLDataSource } from "core/sql";

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

export default class Pages extends SQLDataSource<
  ContentPage,
  ContentPageInput
> {
  readonly collection = "pages";
  async render(
    input: ContentPageInput & { html: string; path: string; title: string }
  ) {
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

  parse(input: ContentPageInput): ContentPageInput & { html: string } {
    try {
      const { data, content } = matter(input.content.trim());
      const html = marked(content);
      const values = { ...data, ...input, content: input.content, html };
      return values;
    } catch (error) {
      throw new HTTPUserInputError("content", error.message);
    }
  }

  async create(input: ContentPageInput) {
    return super.create(this.parse(input));
  }
  async update(id: number, input: ContentPageInput) {
    return super.update(id, this.parse(input));
  }
  // TODO: add caching
  async retrieve(path: string) {
    return this.findOne({
      where: { path },
    }).then((page) => page && this.render(page));
  }
  // TODO: make stream for big sites
  async getSiteMap() {
    return this.context.db
      .query(
        sql`SELECT DISTINCT pages.id, path, title, level, updated FROM ${this.view} 
    JOIN ${this.collection} ON pages.id = child_id
    ORDER BY level ASC `
      )
      .then(({ rows }) => rows);
  }

  // Active schema
  readonly schema: Record<string, ColumnDefinition> = {
    id: { type: "serial", primaryKey: true },
    path: { type: "varchar", length: 255 },
    // TODO: add default template
    template: { type: "varchar", length: 50 },
    title: { type: "varchar", length: 255 },
    description: { type: "text", nullable: true },
    content: { type: "text" },
    html: { type: "text" },
    created: { type: "timestamp", default: "NOW()" },
    updated: { type: "timestamp", nullable: true },
    published: { type: "timestamp", nullable: true },
    code: { type: "int", nullable: false, default: "200" },
    parent_id: { type: "int", nullable: true },
  };

  readonly view: string = "mv_pages_tree";
  readonly migrations = {
    init: {
      up: sql`CREATE TABLE IF NOT EXISTS pages (id serial PRIMARY KEY NOT NULL,path varchar (255) NOT NULL,template varchar (50) NOT NULL,title varchar (255) NOT NULL,description text ,content text NOT NULL,html text NOT NULL,created timestamp NOT NULL DEFAULT NOW(),updated timestamp ,published timestamp ,code int NOT NULL DEFAULT 200)`,
      down: sql`DROP TABLE pages IF EXISTS`,
    },
    add_parent: {
      up: sql`ALTER TABLE pages ADD COLUMN parent_id int`,
      down: sql`ALTER TABLE pages DROP COLUMN parent_id`,
    },
    ref_parent_page: {
      up: sql`ALTER TABLE pages 
      ADD CONSTRAINT pages_parent_key 
      FOREIGN KEY (parent_id) 
      REFERENCES pages (id);`,
      down: sql`ALTER TABLE pages 
      DROP CONSTRAINT pages_parent_key`,
    },
    create_view: {
      up: sql`CREATE MATERIALIZED VIEW IF NOT EXISTS mv_pages_tree AS (
       WITH RECURSIVE x AS (
          SELECT id,parent_id, ARRAY[]::integer[] AS anscestors
          FROM pages
          WHERE parent_id IS NULL
          UNION ALL
          SELECT y.id, y.parent_id, x.anscestors||y.parent_id
          FROM x, pages AS y
          WHERE x.id = y.parent_id
          )
      SELECT id as child_id, parent_id, 0 as level from pages WHERE parent_id IS NULL
      UNION ALL          
      SELECT x.id as child_id,u as parent_id, ARRAY_LENGTH(x.anscestors,1) as level FROM x, UNNEST(x.anscestors) as u
      )`,
      down: sql`DROP MATERIALIZED VIEW mv_pages_tree`,
    },
    create_view_index: {
      up: sql`CREATE UNIQUE INDEX IF NOT EXISTS mv_pages_unique ON mv_pages_tree(child_id,parent_id);`,
      down: sql`DROP INDEX IF EXISTS mv_pages_unique`,
    },
    create_trigger_function: {
      up: sql`CREATE OR REPLACE FUNCTION refresh_pages()
      RETURNS TRIGGER LANGUAGE plpgsql
      AS $$
      BEGIN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pages_tree;
      RETURN NULL;
      END $$;`,
      down: sql`DROP FUNCTION IF EXISTS refresh_pages()`,
    },
    ["create-view-update-trigger"]: {
      up: sql`CREATE TRIGGER pages_view_update AFTER INSERT OR UPDATE OR DELETE ON pages EXECUTE FUNCTION refresh_pages();`,
      down: sql`DROP TRIGGER pages_view_update ON pages`,
    },
  };
}
