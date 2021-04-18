import "./components";
import "./styles.scss";
import gql from "utils/gql";
import api from "./utils/api";
import * as router from "./pages";
import { mount } from "./utils/router";

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

const route = () => {
  if (state.hasAccess) {
    router.authorized(document.location.pathname);
  } else {
    router.initial(document.location.pathname);
  }
};
const app = {
  get state() {
    return { ...state };
  },
  setState(newState) {
    Object.assign(state, newState);
    route();
  },
  async init() {
    mount(route);
    const result = await api.query(ACCESS).catch(console.error);
    this.setState({
      hasAccess: Boolean(result?.data?.access?.canAccessDashboard),
      loading: false,
    });
  },
};
export default app;
