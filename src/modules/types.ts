import Analytics from "./analytics/Analytics";
import Permissions from "./authorization/Permissions";
import Tokens from "./authorization/Tokens";
import Users from "./authorization/Users";
import Pages from "./pages/Pages";
import Scripts from "./scripts/Scripts";
import Styles from "./styles/Styles";
import Templates from "./templates/Templates";

export interface AppDataSources {
  analytics: Analytics;
  permissions: Permissions;
  tokens: Tokens;
  users: Users;
  pages: Pages;
  scripts: Scripts;
  styles: Styles;
  templates: Templates;
}
