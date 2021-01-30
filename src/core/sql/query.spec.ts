import { describe, it } from "mocha";
import { expect } from "chai";
import { where } from "./query";

describe("SQLQuery", () => {
  describe("where", () => {
    it("can create simple where clause", () => {
      expect(where({ email: "email@email.com" })).to.deep.eq([
        "email = ?",
        ["email@email.com"],
      ]);
    });

    it("can create where clause with an operator", () => {
      expect(where({ email: { "=": "email@email.com" } })).to.deep.eq([
        "email = ?",
        ["email@email.com"],
      ]);
      expect(where({ email: { like: "email%" } })).to.deep.eq([
        "email LIKE ?",
        ["email%"],
      ]);
    });

    it("can create where clause with IN operator", () => {
      expect(where({ id: { in: [1, 2, 3] } })).to.deep.eq([
        "id IN (?,?,?)",
        [1, 2, 3],
      ]);
      expect(where({ id: { in: "SELECT 1" } })).to.deep.eq([
        "id IN (SELECT 1)",
        [],
      ]);
    });

    it("can create where clause with BETWEEN operator", () => {
      expect(where({ id: { between: [1, 2] } })).to.deep.eq([
        "id BETWEEN ? AND ?",
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
      ).to.deep.eq(["x > ? AND y > ? AND z < ?", [0, 0, 1]]);
    });

    it("can create where with OR clause", () => {
      expect(
        where([{ x: { ">": 0 } }, { y: { ">": 0 } }, { z: { "<": 1 } }])
      ).to.deep.eq(["x > ? OR y > ? OR z < ?", [0, 0, 1]]);
    });
  });
});
