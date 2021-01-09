import { describe, it } from "mocha";
import { expect } from "chai";
import Redis from "ioredis";
import Templates from "./Templates";
import { TemplateData } from "./types";
import Styles from "../styles/Styles";

const redis = new Redis({ db: 9 });
const styles = new Styles({ redis });
const templates = new Templates({ redis, styles } as any);

const basicTpl: TemplateData = {
  id: "name",
  scope: "source",
  body: `<% name | default: '____' | capitalize %>`,
  head: "Hello, <% name | capitalize %>",
};

describe("Templates Integration test", () => {
  before(async () => {
    redis
      .multi()
      .set("templates::source::name", JSON.stringify(basicTpl))

      .exec();
  });
  after(async () => {
    await redis.flushdb();
    redis.disconnect();
  });

  it("can render simple  template by id", async () => {
    const tpl = await templates.render("name", {
      name: "clark",
      surname: "kent",
    });
    expect(tpl).to.have.property("body", "Clark");
    expect(tpl).to.have.property("head", "Hello, Clark");
  });

  it("can save and compile template", async () => {
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
      style: "body,html{margin:0}",
      scope: "compiled",
    });
  });
});
