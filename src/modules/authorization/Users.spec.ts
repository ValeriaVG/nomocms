import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import Redis from "ioredis";
import bcrypt from "bcryptjs";
import Users from "./Users";

const redis = new Redis({ db: 9 });
const users = new Users({ redis });

const createdAt = Date.now();

describe("Users Integration Test", () => {
  before(() =>
    redis
      .multi()
      .flushdb()
      .hset(
        "users::usr_1",
        "id",
        "usr_1",
        "email",
        "clark.kent@daily.planet",
        "pwhash",
        "$2a$05$omaO8ndXQYtfSMqBsB.6SOrCTR40XDVxG09pHwKlf2eaDQdvbDRaa",
        "createdAt",
        createdAt.toString()
      )
      .zadd("users::email", "0", "clark.kent@daily.planet::usr_1")
      .set("users::next", "1")
      .exec()
  );
  after(async () => {
    await redis.flushdb();
    redis.disconnect();
  });
  it("can find user by email", async () => {
    const user = await users.byEmail("clark.kent@daily.planet");
    expect(user).not.to.be.null;
    expect(user).to.have.property("id", "usr_1");
    expect(user).to.have.property("email", "clark.kent@daily.planet");
    expect(user).to.have.property("createdAt", createdAt);
    expect(await users.byEmail("lex@luther.corp")).to.be.null;
  });
  it("can login user", async () => {
    const user = await users.login({
      email: "clark.kent@daily.planet",
      password: "12345",
    });
    expect(user).not.to.be.null;
    expect(user).to.have.property("id", "usr_1");
    expect(user).to.have.property("email", "clark.kent@daily.planet");
    expect(user).to.have.property("createdAt", createdAt);
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
    expect(user).to.have.property("id", "usr_2");
    expect(user).to.have.property("createdAt");
    const pwhash = await redis.hget("users::usr_2", "pwhash");
    expect(pwhash).to.not.be.empty;
    expect(await bcrypt.compare("54321", pwhash)).to.be.true;
  });
});
