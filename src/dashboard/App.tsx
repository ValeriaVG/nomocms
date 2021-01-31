import * as Preact from "preact";
import { Route, BrowserRouter, Switch } from "react-router-dom";
import { useState } from "preact/hooks";
import { Notification, NotificationContext } from "./utils/notifications";
import { publicPath } from "./config";
import useQuery from "./utils/useQuery";
import Layout from "./Layout";

import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Templates from "./pages/Templates";
import Styles from "./pages/Styles";
import Logout from "./pages/Logout";
import Pages from "./pages/Pages";
import Login from "./pages/login";

export default function App() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { result, loading } = useQuery("/_api/access");
  if (loading) return null;
  if (!result?.canAccessDashboard) return <Login />;
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
