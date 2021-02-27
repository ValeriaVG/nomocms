import api from "./utils/api";
import authorized from "./pages/authorized";
import common from "./pages/common";
import layout from "./layout";

import "./components";
import "./styles.scss";
import gql from "utils/gql";

const state = {
  loading: true,
  hasAccess: false,
};

const ACCESS = gql`
  {
    access {
      canAccessDashboard
    }
  }
`;

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
      const result = await api.query(ACCESS);
      return Boolean(result?.data?.access.canAccessDashboard);
    } catch (error) {
      return false;
    }
  },
  async init() {
    const hasAccess = await this.checkAccess();
    this.setState({ hasAccess, loading: false });
  },
  onStateChange() {
    const router = this.state.hasAccess ? authorized : common;
    const containers = this.state.hasAccess
      ? layout(document.body)
      : document.body;
    return router.mount(containers);
  },
};
export default app;
