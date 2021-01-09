import * as Preact from "preact";
import { Route, BrowserRouter, Switch } from "react-router-dom";
import { dashboard } from "config";
import NotFound from "./pages/NotFound";
import Home from "./pages/home";
import Layout from "./Layout";

import Settings from "./pages/Settings";
import Logout from "./pages/Logout";
import Pages from "./pages/Pages";
import Users from "./pages/Users";
import Templates from "./pages/Templates";
import Styles from "./pages/Styles";

export default function App() {
  return (
    <BrowserRouter basename={dashboard.path}>
      <Layout>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/pages" component={Pages} />
          <Route path="/users" component={Users} />
          <Route path="/templates" component={Templates} />
          <Route path="/styles" component={Styles} />
          <Route path="/settings" component={Settings} />
          <Route path="/logout" component={Logout} />
          <Route path="*" component={NotFound} />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}
