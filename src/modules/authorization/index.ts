import Tokens from "./Tokens";
import Users from "./Users";
import Permissions from "./Permissions";
import { DataSource } from "api/DataSource";

export { default as resolvers } from "./resolvers";

export const dataSources: Record<string, typeof DataSource> = {
  users: Users,
  permissions: Permissions,
  tokens: Tokens,
};
