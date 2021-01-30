import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import { Client } from "pg";
import { createTable, dropTable } from "./table";
import { deleteFrom, insertInto, selectFrom, update } from "./query";

const client = new Client({ user: "amp-cms", password: "amp-cms" });

describe("SQL query builder PostgreSQL integration", () => {
  before(async () => {
    await client.connect();
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

    it("can CRUD item", async () => {
      const create = await client.query(
        ...insertInto("users", { name: "John Doe" }, { returning: ["id"] })
      );
      expect(create.rowCount).to.eq(1);
      const id = create.rows[0].id;
      const get = await client.query(...selectFrom("users", { where: { id } }));
      expect(get.rowCount).to.eq(1);
      expect(get.rows[0]).to.have.property("id", id);
      expect(get.rows[0]).to.have.property("name", "John Doe");
      const upd = await client.query(
        ...update("users", {
          where: { id },
          set: { name: "Jane Doe" },
          returning: "*",
        })
      );
      expect(upd.rowCount).to.eq(1);
      expect(upd.rows[0]).to.have.property("id", id);
      expect(upd.rows[0]).to.have.property("name", "Jane Doe");
      const del = await client.query(
        ...deleteFrom("users", {
          where: { id },
        })
      );
      expect(del.rowCount).to.eq(1);
    });
  });
});
