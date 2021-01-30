import { describe, it } from "mocha";
import { expect } from "chai";
import { AlterMode, alterTable, createTable, dropTable } from "./table";

describe("SQLTable", () => {
  it("can generate create table query", () => {
    expect(
      createTable(
        "users",
        {
          id: { type: "serial", primaryKey: true },
          name: { type: "varchar", length: 255, nullable: true },
          pwhash: { type: "text" },
          email: { type: "varchar", length: 50, unique: true },
          created_at: { type: "timestamp", default: "NOW()" },
        },
        { ifNotExists: true }
      )
    ).to.eq(
      "CREATE TABLE IF NOT EXISTS users (" +
        "id serial PRIMARY KEY NOT NULL," +
        "name varchar (255)," +
        "pwhash text NOT NULL," +
        "email varchar (50) UNIQUE NOT NULL," +
        "created_at timestamp NOT NULL DEFAULT NOW()" +
        ");"
    );
    expect(
      createTable("users", {
        id: { type: "serial", primaryKey: true },
        name: { type: "varchar", length: 255, nullable: true },
        pwhash: { type: "text" },
        email: { type: "varchar", length: 50, unique: true },
        created_at: { type: "timestamp", default: "NOW()" },
      })
    ).to.eq(
      "CREATE TABLE users (" +
        "id serial PRIMARY KEY NOT NULL," +
        "name varchar (255)," +
        "pwhash text NOT NULL," +
        "email varchar (50) UNIQUE NOT NULL," +
        "created_at timestamp NOT NULL DEFAULT NOW()" +
        ");"
    );
  });
  it("can generate drop table query", () => {
    expect(dropTable("users")).to.eq("DROP TABLE users");
    expect(dropTable("users", { ifExists: true })).to.eq(
      "DROP TABLE IF EXISTS users"
    );
  });
  it("can generate alter table query", () => {
    expect(
      alterTable("users", {
        mode: AlterMode.add,
        name: "email",
        definition: { type: "varchar", length: 255, unique: true },
      })
    ).to.eq("ALTER TABLE users ADD email varchar (255) UNIQUE NOT NULL");
    expect(
      alterTable("users", {
        mode: AlterMode.drop,
        name: "email",
      })
    ).to.eq("ALTER TABLE users DROP COLUMN email");
  });
});
