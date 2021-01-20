import { describe, it } from "mocha";
import { expect } from "chai";
import SQLTable, { Column } from "./SQLTable";

class Users extends SQLTable {
  @Column({ type: "serial", primaryKey: true })
  id: string;
  @Column({ type: "varchar", length: 255, nullable: true })
  name?: string;
  @Column({ type: "text" })
  pwhash: string;
  @Column({ type: "varchar", length: 50, unique: true })
  email: string;
  @Column({ type: "timestamp", default: "NOW()" })
  created_at: number;
}

describe("SQLTable", () => {
  it("can generate create table query", () => {
    expect(Users.createTableQuery()).to.eq(
      "CREATE TABLE users (" +
        "id serial PRIMARY KEY NOT NULL," +
        "name varchar (255)," +
        "pwhash text NOT NULL," +
        "email varchar (50) UNIQUE NOT NULL," +
        "created_at timestamp NOT NULL DEFAULT NOW()" +
        ");"
    );
  });

  it("can generate select query", () => {
    expect(Users.selectQuery({ id: 1 }, { limit: 1 })).to.deep.eq([
      "SELECT * FROM users WHERE id=? LIMIT ?",
      [1, 1],
    ]);
    expect(
      Users.selectQuery({ id: { ">=": 10 } }, { orderBy: ["id", "desc"] })
    ).to.deep.eq([
      "SELECT * FROM users WHERE id>=? ORDER BY ? DESC",
      [10, "id"],
    ]);
    expect(
      Users.selectQuery(
        { or: [{ name: "John" }, { name: "Jane" }] },
        { limit: 10, offset: 5 }
      )
    ).to.deep.eq([
      "SELECT * FROM users WHERE name=? OR name=? LIMIT ? OFFSET ?",
      ["John", "Jane", 10, 5],
    ]);
    // TODO: AND
    // expect(Users.selectQuery({ name: "John", surname: "Doe" })).to.deep.eq([
    //   "SELECT * FROM users WHERE name=? AND surname=?",
    //   ["John", "Doe"],
    // ]);
  });
  it("can generate insert query", () => {
    expect(Users.insertQuery({ name: "John", surname: "Doe" })).to.deep.eq([
      "INSERT INTO users (name, surname) VALUES(?,?)",
      ["John", "Doe"],
    ]);
  });
  it("can generate update query");
  it("can generate delete query");
  it("can generate select query");

  it("can generate sync table queries");
});
