import { describe, it } from "mocha";
import chai, { expect } from "chai";
import resolvers from "../resolvers";
import { mockDatabase } from "mocks";
import Pages from "../Pages";
import { createTable, insertInto } from "core/sql";
import like from "chai-like";
chai.use(like);

describe("pages.resolvers", () => {
  it("can list pages", async () => {
    const db = mockDatabase();
    const pages = new Pages({ db });

    await db.query(createTable(pages.collection, pages.schema));
    await db.query(
      ...insertInto(pages.collection, [
        {
          parent_id: null,
          title: "Home",
          path: "/",
          template: "default",
          content: "Home",
          html: "",
        },
        {
          parent_id: null,
          title: "Stories",
          path: "/stories",
          template: "default",
          content: "Stories",
          html: "",
        },
        {
          parent_id: 2,
          title: "Story 1",
          path: "/stories/1",
          template: "default",
          content: "Story 1",
          html: "",
        },
        {
          parent_id: 2,
          title: "Story 2",
          path: "/stories/2",
          template: "default",
          content: "Story 2",
          html: "",
        },
      ])
    );
    const menu = await resolvers.Query.pages({}, { pages });
    expect(menu).to.be.like({
      items: [
        {
          id: 1,
          title: "Home",
          path: "/",
          code: 200,
        },
        {
          id: 2,
          title: "Stories",
          path: "/stories",
          code: 200,
        },
      ],
    });

    const submenu = await resolvers.Query.pages({ parent: 2 }, { pages });
    expect(submenu).to.be.like({
      items: [
        {
          id: 3,
          title: "Story 1",
          path: "/stories/1",
          code: 200,
        },
        {
          id: 4,
          title: "Story 2",
          path: "/stories/2",
          code: 200,
        },
      ],
    });
  });
});
