import "./components";
import "./pages";
import "./styles.scss";
import gql from "utils/gql";
import api from "./utils/api";
import { createStateEmitter } from "./utils/state";
import markup from "./markup";
import SnackBar from "./components/snack-bar";

const ACCESS = gql`
  {
    access {
      canAccessDashboard
    }
  }
`;

const app = {
  ...createStateEmitter({
    loading: true,
    hasAccess: false,
  }),
  async mount(element: HTMLElement) {
    // Mount loading page
    const snackbar = document.createElement("snack-bar") as SnackBar;
    element.appendChild(snackbar);
    const processUpdates = ({ loading, hasAccess }) => {
      const loadingScreen = element.querySelector("loading-screen");
      if (loading && !loadingScreen) {
        element.insertBefore(
          document.createElement("loading-screen"),
          snackbar
        );
        return;
      }
      if (!loading && loadingScreen) element.removeChild(loadingScreen);

      const loginPage = element.querySelector("login-page");
      if (!hasAccess) {
        if (!loginPage)
          element.insertBefore(document.createElement("login-page"), snackbar);
        return;
      }
      if (hasAccess) {
        if (loginPage) element.removeChild(loginPage);
        const tmp = document.createElement("main");
        tmp.innerHTML = markup;
        for (const child of tmp.children) {
          element.appendChild(child);
        }
      }
    };
    this.onUpdate(processUpdates);
    processUpdates(this.getState());
    // Fetch access

    const result = await api.query<{
      access: { canAccessDashboard: boolean };
    }>(ACCESS);

    this.setState({
      hasAccess: Boolean(
        "data" in result && result.data?.access?.canAccessDashboard
      ),
      loading: false,
    });
  },
};
export default app;
