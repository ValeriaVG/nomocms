import { describe, it } from "mocha";
import { expect } from "chai";
import directives from "../directiveResolvers";
import { HTTPNotAuthorized } from "core/errors";
import { superuser } from "config";

const { requiresUser, requiresPermission } = directives;
describe("requiresUser", () => {
  it("executes function if user exists", async () => {
    const ctx = {
      user: { id: "usr_1" },
    };

    expect(
      await requiresUser(
        () => {
          return { ok: 1 };
        },
        null,
        null,
        ctx
      )
    ).to.have.property("ok", 1);
  });
  it("throws error if no users are authorized", async () => {
    const ctx = {};
    try {
      requiresUser(
        () => {
          throw "should not execute";
        },
        null,
        null,
        ctx
      );
    } catch (error) {
      expect(error).to.be.instanceOf(HTTPNotAuthorized);
      expect(ctx).not.to.have.property("user");
    }
  });
});

describe("requiresPermission", () => {
  it("throws error if no users are authorized", async () => {
    const ctx = {};
    try {
      requiresUser(
        () => {
          throw "should not execute";
        },
        null,
        null,
        ctx
      );
    } catch (error) {
      expect(error).to.be.instanceOf(HTTPNotAuthorized);
      expect(ctx).not.to.have.property("user");
    }
  });
  it("executes function if user has access", async () => {
    const ctx = {
      user: { id: "usr_1" },
      permissions: {
        check({ scope, permissions, user_id }) {
          return Promise.resolve(
            scope === "pages" && permissions === 1 && user_id === "usr_1"
          );
        },
      },
    };

    expect(
      await requiresUser(
        () => {
          return { ok: 1 };
        },
        null,
        { scope: "pages", min: "read" },
        ctx
      )
    ).to.have.property("ok", 1);
  });
  it("executes function if for superuser", async () => {
    const ctx = {
      user: { email: superuser.email },
      permissions: {
        check: () => false,
      },
    };

    expect(
      await requiresUser(
        () => {
          return { ok: 1 };
        },
        null,
        { scope: "pages", min: "all" },
        ctx
      )
    ).to.have.property("ok", 1);
  });
});
