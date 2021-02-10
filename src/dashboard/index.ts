import api from "./utils/api";
import renderAuthorized from "./pages/authorized";
import renderCommon from "./pages/common";
import layout from "./layout";

import "./components";
import "./styles.scss";
const state = {
  loading: true,
  hasAccess: false,
};

const app = {
  get state() {
    return state;
  },
  setState(patch) {
    Object.assign(state, patch);
    this.onStateChange();
  },
  checkAccess: async () => {
    try {
      const result = await api.get("/_api/access");
      return Boolean(result?.canAccessDashboard);
    } catch (error) {
      console.error(error);
      return false;
    }
  },
  init() {
    this.checkAccess().then((hasAccess) => {
      this.setState({ hasAccess, loading: false });
    });
  },
  onStateChange() {
    if (this.state.hasAccess) return renderAuthorized(layout(document.body));
    return renderCommon(document.body);
  },
};

app.init();
export default app;
