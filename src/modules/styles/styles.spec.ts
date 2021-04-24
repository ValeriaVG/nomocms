import { describe, it } from "mocha";
import { expect } from "chai";
import Styles from "./Styles";
import Templates from "../templates/Templates";
import { mockDatabase } from "mocks";
import { createTable, insertInto } from "core/sql";

const db = mockDatabase();
const ctx: any = { db };
const styles = new Styles(ctx);
const templates = new Templates(ctx);
ctx["styles"] = styles;
ctx["templates"] = templates;

describe("Styles Integration Test", () => {
  before(async () => {
    await db.query(createTable(templates.collection, templates.schema));
    await db.query(createTable(styles.collection, styles.schema));
    await db.query(
      ...insertInto(styles.collection, {
        id: "colors",
        source: `$red: red;\n$blue: blue;`,
      })
    );
  });

  it("can compile simple scss", async () => {
    const result = await styles.compile("$color: red; body{background:$color}");
    const css = result.css.toString();
    expect(css).to.eq("body{background:red}");
  });

  it("can resolve imported scss", async () => {
    const result = await styles.compile(
      "@use 'colors'; body{background:colors.$red}"
    );
    const css = result.css.toString();
    expect(css).to.eq("body{background:red}");
  });

  it("can delete styles", async () => {
    expect(
      await styles.create({ id: "delete-me", source: "body{margin:0;}" })
    ).to.deep.eq({
      id: "delete-me",
      source: "body{margin:0;}",
      compiled: "body{margin:0}",
    });
    expect(await styles.get("delete-me")).to.have.property(
      "source",
      "body{margin:0;}"
    );
    expect(await styles.get("delete-me")).to.have.property(
      "compiled",
      "body{margin:0}"
    );
    expect(await styles.delete("delete-me")).to.deep.eq({
      deleted: true,
    });
    expect(await styles.get("delete-me")).to.be.undefined;
  });
});
