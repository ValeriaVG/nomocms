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
      .hset(
        "styles::colors",
        "id",
        "colors",
        "source",
        "$red: red;\n$blue: blue;"
      )
      .zadd("styles", "0", "colors")
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

  it("can list styles", async () => {
    const result = await styles.list();
    expect(result).to.have.property("items");
    expect(result).to.have.property("nextOffset");
    expect(result.items).to.have.length(1);
    expect(result).to.have.property("count", 1);
    expect(result.items[0]).to.have.property("id", "colors");
    expect(result.items[0]).to.have.property(
      "source",
      "$red: red;\n$blue: blue;"
    );
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
    expect(await styles.get("delete-me")).to.be.null;
  });
});
