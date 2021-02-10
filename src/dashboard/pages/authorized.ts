import createRouter from "dashboard/utils/router";
import Home from "./Home";

export default (container: HTMLElement) =>
  createRouter({ "/": Home }, container);
