import { describe, it, before } from "mocha";
import { expect } from "chai";
import bcrypt from "bcryptjs";
import Users from "../Users";
import Permissions from "../Permissions";
import { mockDatabase } from "mocks";
import Tokens from "../Tokens";
import { createTable, insertInto } from "core/sql";

const db = mockDatabase();
const ctx = { db };
const permissions = new Permissions(ctx);
ctx["permissions"] = permissions;
const tokens = new Tokens(ctx);
ctx["tokens"] = tokens;
const users = new Users(ctx);

describe("Users Integration Test", () => {
  before(async () => {
    await db.query(
      createTable(permissions.collection, permissions.schema, {
        primaryKey: permissions.primaryKey,
      })
    );
    await db.query(
      createTable(tokens.collection, {
        ...tokens.schema,
        // Mock doesn't support these
        ip: { type: "varchar", nullable: true },
        expires: { type: "timestamp", nullable: true },
      })
    );
    await db.query(createTable(users.collection, users.schema));
    await db.query(
      ...insertInto(users.collection, {
        email: "clark.kent@daily.planet",
        pwhash: "$2a$05$omaO8ndXQYtfSMqBsB.6SOrCTR40XDVxG09pHwKlf2eaDQdvbDRaa",
      })
    );
  });

  it("can find user by email", async () => {
    const user = await users.byEmail("clark.kent@daily.planet");
    expect(user).not.to.be.null;
    expect(user).to.have.property("id", 1);
    expect(user).to.have.property("email", "clark.kent@daily.planet");
    expect(user).to.have.property("created");
    expect(await users.byEmail("lex@luther.corp")).to.be.undefined;
  });
  it("can login user", async () => {
    const user = await users.login({
      email: "clark.kent@daily.planet",
      password: "12345",
    });
    expect(user).not.to.be.null;
    expect(user).to.have.property("id", 1);
    expect(user).to.have.property("email", "clark.kent@daily.planet");
    expect(user).to.have.property("created");
  });
  it("doesnt log user in with wrong password", async () => {
    try {
      await users.login({
        email: "clark.kent@daily.planet",
        password: "54321",
      });
      throw Error("Should not login");
    } catch (error) {
      expect(error.message).to.match(/wrong|password/);
    }
  });
  it("doesnt log user in with wrong email", async () => {
    try {
      await users.login({
        email: "clark@daily.planet",
        password: "12345",
      });
      throw Error("Should not login");
    } catch (error) {
      expect(error.message).to.match(/wrong|email/);
    }
  });

  it("can create user", async () => {
    const user = await users.create({
      email: "admin@website.com",
      password: "54321",
    });
    expect(user).not.to.be.null;
    expect(user).to.have.property("id", 2);
    expect(user).to.have.property("created");
    expect(user).to.have.property("pwhash");
    expect(await bcrypt.compare("54321", user.pwhash)).to.be.true;
  });
});
