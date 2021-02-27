import Pages from "./Pages";
import resolvers from "./resolvers";
import typeDefs from "./typeDefs";

export default {
  typeDefs,
  resolvers,
  dataSources: {
    pages: Pages,
  },
};
