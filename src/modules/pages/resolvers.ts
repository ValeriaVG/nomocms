import { createResolvers } from "utils/createResolvers";
import Pages from "./Pages";
const pageResolvers = createResolvers("pages");

export default {
  Mutation: pageResolvers.Mutation,
  Query: {
    ...pageResolvers.Query,
    pages: async (
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
    },
  },
};
