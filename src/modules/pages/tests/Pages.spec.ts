import { describe, it } from "mocha";
import { expect } from "chai";
import Pages from "../Pages";
import { createTable } from "core/sql";
import { mockDatabase } from "mocks";

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
});
