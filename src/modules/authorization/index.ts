import Tokens from "./Tokens";
import Users from "./Users";
import Permissions from "./Permissions";
import directiveResolvers from "./directiveResolvers";
import resolvers from "./resolvers";
import typeDefs from "./typeDefs";

export default {
  dataSources: {
    users: Users,
    permissions: Permissions,
    tokens: Tokens,
  },
  directiveResolvers,
  resolvers,
  typeDefs,
};
