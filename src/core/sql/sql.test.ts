import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import { Client } from "pg";
import { createTable, dropTable } from "./table";
import { insertInto } from "./query";

const client = new Client({ user: "amp-cms", password: "amp-cms" });

describe("SQL query builder PostgreSQL integration", () => {
  before(async () => {
    await client.connect();
    await client.query("DROP DATABASE IF EXISTS test");
    await client.query("CREATE DATABASE test");
    client.database = "test";
  });
  after(async () => {
    await client.end();
  });
  describe("table", () => {
    it("can create table", async () => {
      const result = await client.query(
        createTable("items", {
          id: { type: "serial", primaryKey: true },
          name: { type: "varchar", length: 255, nullable: true },
          created_at: { type: "timestamp", default: "NOW()" },
        })
      );
      expect(result).to.have.property("command", "CREATE");
    });
    it("can drop table", async () => {
      const result = await client.query(dropTable("items"));
      expect(result).to.have.property("command", "DROP");
    });
  });
  describe("query", () => {
    before(() =>
      client.query(
        createTable(
          "users",
          {
            id: { type: "serial", primaryKey: true },
            name: { type: "varchar", length: 255, nullable: true },
            age: { type: "int", nullable: true },
          },
          { ifNotExists: true }
        )
      )
    );
    after(() => client.query(dropTable("users", { ifExists: true })));

    it("can insert item", async () => {
      const result = await client.query(
        ...insertInto("users", { name: "John Doe" })
      );
      expect(result.rowCount).to.eq(1);
    });
  });
});
