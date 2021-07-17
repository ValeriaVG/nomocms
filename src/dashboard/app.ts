import "./components";
import "./pages";
import "./styles.scss";
import gql from "utils/gql";
import api from "./utils/api";
import { createStateEmitter } from "./utils/state";
import { html } from "amp/lib";
import markup from "./markup";

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
  mount(element: HTMLElement) {
    // Mount loading page
    const processUpdates = ({ loading, hasAccess }) => {
      if (loading)
        return (element.innerHTML = html`<loading-screen></loading-screen
          ><snack-bar></snack-bar>`);
      if (hasAccess) return (element.innerHTML = markup);
      element.innerHTML = html`<login-page></login-page
        ><snack-bar></snack-bar>`;
    };
    this.onUpdate(processUpdates);
    processUpdates(this.getState());
    // Fetch access
    (async () => {
      const result = await api.query(ACCESS).catch(console.error);
      this.setState({
        hasAccess: Boolean(result?.data?.access?.canAccessDashboard),
        loading: false,
      });
    })();
  },
};
export default app;
