import { describe, it } from "mocha";
import { expect } from "chai";
import Templates from "./Templates";
import Styles from "../styles/Styles";
import { mockDatabase } from "mocks";
import { createTable, insertInto } from "core/sql";

const db = mockDatabase();
const styles = new Styles({ db } as any);
const templates = new Templates({ db, styles } as any);

describe("Templates Integration test", () => {
  before(async () => {
    await db.query(createTable(templates.collection, templates.schema));
    await db.query(createTable(styles.collection, styles.schema));
    await db.query(
      ...insertInto(templates.collection, {
        id: "name",
        body: `<% name | default: ____ | capitalize %>`,
        head: "Hello, <% name | capitalize %>",
      })
    );
  });

  it("can render simple  template by id", async () => {
    const tpl = await templates.render("name", {
      name: "clark",
      surname: "kent",
    });
    expect(tpl).to.have.property("body", "Clark");
    expect(tpl).to.have.property("head", "Hello, Clark");
  });

  it("can compile and save template", async () => {
    const tpl = await templates.update("name", {
      head:
        '<title><% title %></title>\n<script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>',
      body: `<template type="amp-mustache">
  Hello {{world}}!
</template>`,
      style: `body,html{margin:0;}`,
    });

    expect(tpl).to.deep.eq({
      id: "name",
      head:
        "<title><% title %></title>\n" +
        '<script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>',
      body: '<template type="amp-mustache">\n  Hello {{world}}!\n</template>',
      style: "body,html{margin:0;}",
      compiled: "body,html{margin:0}",
      script: null,
    });
  });
});
