import { describe, it } from "mocha";
import { expect } from "chai";
import { where, selectFrom, deleteFrom, insertInto, update } from "./query";

describe("SQLQuery", () => {
  describe("where", () => {
    it("can create simple where clause", () => {
      expect(where({ email: "email@email.com" })).to.deep.eq([
        "email = $1",
        ["email@email.com"],
      ]);
    });

    it("can create where clause with an operator", () => {
      expect(where({ email: { "=": "email@email.com" } })).to.deep.eq([
        "email = $1",
        ["email@email.com"],
      ]);
      expect(where({ email: { like: "email%" } })).to.deep.eq([
        "email LIKE $1",
        ["email%"],
      ]);
    });

    it("can create where clause with IN operator", () => {
      expect(where({ id: { in: [1, 2, 3] } })).to.deep.eq([
        "id IN ($1,$2,$3)",
        [1, 2, 3],
      ]);
      expect(where({ id: { in: "SELECT 1" } })).to.deep.eq([
        "id IN (SELECT 1)",
        [],
      ]);
    });

    it("can create where clause with BETWEEN operator", () => {
      expect(where({ id: { between: [1, 2] } })).to.deep.eq([
        "id BETWEEN $1 AND $2",
        [1, 2],
      ]);
    });

    it("can create where clause with IS (NOT) NULL", () => {
      expect(where({ deleted_at: { is: "NULL" } })).to.deep.eq([
        "deleted_at IS NULL",
        [],
      ]);
    });

    it("can create where with AND clause", () => {
      expect(
        where({ x: { ">": 0 }, y: { ">": 0 }, z: { "<": 1 } })
      ).to.deep.eq(["x > $1 AND y > $2 AND z < $3", [0, 0, 1]]);
    });

    it("can create where with OR clause", () => {
      expect(
        where([{ x: { ">": 0 } }, { y: { ">": 0 } }, { z: { "<": 1 } }])
      ).to.deep.eq(["x > $1 OR y > $2 OR z < $3", [0, 0, 1]]);
    });
  });

  describe("selectFrom", () => {
    it("can create simple select query", () => {
      expect(selectFrom("users")).to.deep.eq(["SELECT * FROM users", []]);
      expect(selectFrom("users", { columns: "id" })).to.deep.eq([
        "SELECT id FROM users",
        [],
      ]);
      expect(selectFrom("users", { columns: ["id", "name"] })).to.deep.eq([
        "SELECT id,name FROM users",
        [],
      ]);
    });
    it("can create  select query with limit/offset", () => {
      expect(selectFrom("users", { limit: 10, offset: 5 })).to.deep.eq([
        "SELECT * FROM users LIMIT $1 OFFSET $2",
        [10, 5],
      ]);
    });
    it("can create  select query with where clause", () => {
      expect(selectFrom("users", { where: { id: 1 } })).to.deep.eq([
        "SELECT * FROM users WHERE id = $1",
        [1],
      ]);
    });
    it("can create  select query with sort clause", () => {
      expect(selectFrom("users", { orderBy: { id: "ASC" } })).to.deep.eq([
        "SELECT * FROM users ORDER BY id ASC",
        [],
      ]);
      expect(
        selectFrom("users", { orderBy: { surname: "DESC", name: "DESC" } })
      ).to.deep.eq(["SELECT * FROM users ORDER BY surname DESC,name DESC", []]);
    });
  });

  describe("delete", () => {
    it("can create delete query", () => {
      expect(deleteFrom("users", { where: { id: 1 } })).to.deep.eq([
        "DELETE FROM users WHERE id = $1",
        [1],
      ]);
    });
  });

  describe("insertInto", () => {
    it("can create insert query", () => {
      expect(insertInto("users", { name: "John", surname: "Doe" })).to.deep.eq([
        "INSERT INTO users (name,surname) VALUES ($1,$2)",
        ["John", "Doe"],
      ]);
    });
  });

  describe("update", () => {
    it("can create update query", () => {
      expect(
        update("users", {
          where: { id: 1 },
          set: { name: "John", surname: "Doe" },
        })
      ).to.deep.eq([
        "UPDATE users SET name=$1,surname=$2 WHERE id = $3",
        ["John", "Doe", 1],
      ]);
    });
  });
});
