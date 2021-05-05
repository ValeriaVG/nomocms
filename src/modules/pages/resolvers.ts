import boilerplate from "amp/boilerplate";
import { createResolvers } from "utils/createResolvers";
import Pages from "./Pages";
const pageResolvers = createResolvers("pages");

const listPages = async (
  _,
  {
    parent,
    limit,
    offset,
  }: { parent?: number; limit?: number; offset?: number },
  { pages }: { pages: Pages }
) => {
  const items = await pages.find({
    where: { parent_id: parent || { is: "NULL" } },
    limit: limit || 10,
    offset: offset || 0,
  });
  return { items };
};

const previewPage = async (_, { input }, { pages }: { pages: Pages }) => {
  const values = pages.parse(input);
  const result = await pages.render({ ...input, ...values }, true);
  return boilerplate({ ...result, url: "/_preview" });
};

export default {
  Mutation: pageResolvers.Mutation,
  Query: {
    ...pageResolvers.Query,
    pages: listPages,
    pagePreview: previewPage,
  },
  Page: {
    parent: ({ parent_id }, _, { pages }: { pages: Pages }) =>
      parent_id && pages.get(parent_id),
    children: ({ id }, params, ctx) =>
      listPages(null, { ...params, parent: id }, ctx),
  },
};
