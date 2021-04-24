import { describe, it } from "mocha";
import { expect } from "chai";
import Pages from "../Pages";
import { createTable } from "core/sql";
import { mockDatabase } from "mocks";
import Templates from "modules/templates/Templates";

describe("Pages", () => {
  it("can create a page", async () => {
    const db = mockDatabase();
    const pages = new Pages({ db });
    await db.query(createTable(pages.collection, pages.schema));
    const content = `
---
path: /
title: Example Page
---

# Page Title
Page Content
    `;
    const page = await pages.create({ content, template: "page" });
    expect(page).to.have.property("path", "/");
    expect(page).to.have.property("title", "Example Page");
    expect(page).to.have.property("content", content);
    expect(page).to.have.property("template", "page");
  });
  it("can update a page", async () => {
    const db = mockDatabase();
    const pages = new Pages({ db });
    await db.query(createTable(pages.collection, pages.schema));
    const content = `
---
path: /
title: Example Page
---

# Page Title
Page Content
    `;
    const { id } = await pages.create({ content, template: "page" });
    const updatedContent = `
---
path: /*
title: Other Page
code: 404
---

# Page Title
Page Content
    `;
    const page = await pages.update(id, {
      content: updatedContent,
      template: "other",
    });
    expect(page).to.have.property("path", "/*");
    expect(page).to.have.property("title", "Other Page");
    expect(page).to.have.property("content", updatedContent);
    expect(page).to.have.property("template", "other");
    expect(page).to.have.property("code", 404);
  });

  it("renders with default template if none provided", async () => {
    const db = mockDatabase();
    const templates = new Templates({ db });
    const pages = new Pages({ db, templates } as any);
    await db.query(createTable(pages.collection, pages.schema));
    await db.query(createTable(templates.collection, templates.schema));
    await pages.create({
      content: `
---
path: /
title: Example Page
---

# Page Title
Page Content
        `,
    });
    const { body } = await pages.retrieve("/");
    expect(body).to.be.equal(
      '<h1 id="page-title">Page Title</h1>\n<p>Page Content</p>\n'
    );
  });
  it("renders children pages", async () => {
    const db = mockDatabase();
    const templates = new Templates({ db });
    const pages = new Pages({ db, templates } as any);
    await db.query(createTable(pages.collection, pages.schema));
    await db.query(createTable(templates.collection, templates.schema));
    await templates.create({
      id: "list",
      body: `<ul>
{%- for item in items -%}
<li>
<a href="<% item.path %>"><% item.title %></a>
</li>      
{%- endfor -%}
</ul>`,
    });
    const { id } = await pages.create({
      content: `
---
path: /
title: List
template: list
---`,
    });
    await pages.create({
      parent_id: id,
      content: `
---
path: /page-1
title: Page 1
---`,
    });
    await pages.create({
      parent_id: id,
      content: `
---
path: /page-2
title: Page 2
---`,
    });
    const { body } = await pages.retrieve("/");
    expect(body).to.be.equal(
      '<ul><li>\n<a href="/page-1">Page 1</a>\n</li><li>\n<a href="/page-2">Page 2</a>\n</li></ul>'
    );
  });
});
