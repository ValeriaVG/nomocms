import Pages from "./Pages";

export default {
  Query: {
    pages: async (
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
