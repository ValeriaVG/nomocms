import * as Preact from "preact";
import { useState } from "preact/hooks";
import { publicPath } from "./config";
import { BrowserRouter, Route, Switch } from "./utils/BrowserRouter";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Layout from "./Layout";
import Pages from "./pages/Pages";
import Users from "./pages/Users";
import Templates from "./pages/Templates";
import Styles from "./pages/Styles";
import Logout from "./pages/Logout";
import { Notification, NotificationContext } from "./utils/notifications";

export default function Dashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      <BrowserRouter basename={publicPath}>
        <Layout>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/pages" component={Pages} />
            <Route path="/users" component={Users} />
            <Route path="/templates" component={Templates} />
            <Route path="/styles" component={Styles} />
            <Route path="/logout" component={Logout} />
            <Route path="*" component={NotFound} />
          </Switch>
        </Layout>
      </BrowserRouter>
    </NotificationContext.Provider>
  );
}
