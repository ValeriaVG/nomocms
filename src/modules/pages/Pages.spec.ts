import { describe, it } from "mocha";
import { newDb } from "pg-mem";
import { expect } from "chai";
import Pages from "./Pages";
import { Client } from "pg";
import { createTable } from "core/sql";

const mockDatabase = () => {
  const db = newDb();
  return {
    query: async (query: string, values: any[]) =>
      db.public.query(
        query.replace(/\$(\d+)/gi, (s) => {
          const idx = parseInt(s.slice(1));
          const value = values[idx - 1];
          return typeof value === "string"
            ? `'${value}'`
            : JSON.stringify(value);
        })
      ),
  } as Client;
};

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
