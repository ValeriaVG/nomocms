import Tokens from "./Tokens";
import Users from "./Users";
import Permissions from "./Permissions";
import { DataSource } from "core/DataSource";
export { default as routes } from "./routes";

export const dataSources: Record<string, typeof DataSource> = {
  users: Users,
  permissions: Permissions,
  tokens: Tokens,
};
