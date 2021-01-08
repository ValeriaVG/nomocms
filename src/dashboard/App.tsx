import * as Preact from "preact";
import { Route, BrowserRouter, Switch } from "react-router-dom";
import { dashboard } from "config";
import NotFound from "./pages/NotFound";
import Home from "./pages/home";
import Layout from "./Layout";

export default function App() {
  return (
    <BrowserRouter basename={dashboard.path}>
      <Layout>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="*" component={NotFound} />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}
