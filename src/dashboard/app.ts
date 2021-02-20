import api from "./utils/api";
import authorized from "./pages/authorized";
import common from "./pages/common";
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
    const router = this.state.hasAccess ? authorized : common;
    const container = this.state.hasAccess
      ? layout(document.body)
      : document.body;
    return router.mount(container);
  },
};
export default app;
