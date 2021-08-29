import Tokens from "./Tokens";
import Users from "./Users";
import Permissions from "./Permissions";
import routes from "./routes";

export default {
  dataSources: {
    users: Users,
    permissions: Permissions,
    tokens: Tokens,
  },
  routes,
};
