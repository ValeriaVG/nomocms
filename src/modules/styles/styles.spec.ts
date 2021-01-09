import { describe, it } from "mocha";
import { expect } from "chai";
import Redis from "ioredis";
import Styles from "./Styles";

const redis = new Redis({ db: 9 });

const styles = new Styles({ redis });

describe("Styles Integration Test", () => {
  before(async () => {
    redis
      .multi()
      .set("styles::source::colors", "$red: red;\n$blue: blue;")
      .set("styles::compiled::header", ".header{background:green}")
      .set("styles::compiled::body", "body{background:red}")
      .exec();
  });
  after(async () => {
    await redis.flushdb();
    redis.disconnect();
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

  it("stores compilation results", async () => {
    await styles.compiled.save(
      "name",
      "@use 'colors'; body{background:colors.$red}"
    );
    expect(await styles.compiled.get("name")).to.have.property(
      "data",
      "body{background:red}"
    );
  });

  it("stores compiled styles merged together", async () => {
    expect(await styles.merged(["header", "body"])).to.eq(
      ".header{background:green} body{background:red} "
    );
    expect(await styles.merged(["body", "header"])).to.eq(
      "body{background:red} .header{background:green} "
    );
  });
  it("can list source  styles", async () => {
    const result = await styles.list();
    expect(result).to.have.property("items");
    expect(result).to.have.property("nextOffset");
    expect(result.items).to.have.length(1);
    expect(result.items[0]).to.have.property("id", "colors");
    expect(result.items[0]).to.have.property(
      "data",
      "$red: red;\n$blue: blue;"
    );
  });
  it("can delete styles", async () => {
    expect(await styles.save("delete-me", "body{margin:0;}")).to.deep.eq({
      saved: true,
    });
    expect(await styles.get("delete-me")).to.have.property(
      "data",
      "body{margin:0;}"
    );
    expect(await styles.compiled.get("delete-me")).to.have.property(
      "data",
      "body{margin:0}"
    );
    expect(await styles.delete("delete-me")).to.deep.eq({
      deleted: true,
    });
    expect(await styles.get("delete-me")).to.be.null;
    expect(await styles.compiled.get("delete-me")).to.be.null;
  });
});
