import Pages from "./Pages";
import resolvers from "./resolvers";
import typeDefs from "./typeDefs";
import routes from "./routes";

export default {
  typeDefs,
  resolvers,
  dataSources: {
    pages: Pages,
  },
  routes,
};
