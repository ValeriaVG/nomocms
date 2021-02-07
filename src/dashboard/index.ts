import createRouter from "./utils/router";
import "./styles.scss";
import api from "./utils/api";

import Home from "./pages/Home";
import Login from "./pages/Login";

const renderDashboard = () => createRouter({ "/": Home }, document.body);
const renderLogin = () => createRouter({ "*": Login }, document.body);

(async () => {
  try {
    const result = await api.get("/_api/access");
    console.log(result);
    if (result.canAccessDashboard) return renderDashboard();
  } catch (error) {
    console.error(error);
  }
  renderLogin();
})();
