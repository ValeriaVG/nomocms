import createRoutes from "utils/routes";
import { Mountable } from "../types";

export const redirect = (to: string) => {
  history.pushState({ to }, "", to);
  window.dispatchEvent(new CustomEvent("pushstate", { detail: { to } }));
};

export default function createRouter(routes: Record<string, Mountable>) {
  const state: { container?: HTMLElement } = {};
  const matchRoute = createRoutes(routes);
  const renderPage = () => {
    if (!state.container) throw new Error("Router does not have a container");
    const path = document.location.pathname;
    const [page, params] = matchRoute(path);
    if (!page) return;
    if (typeof page === "string") return (state.container.innerHTML = page);
    page.render(state.container, params);
  };

  const onPageChange = () => {
    renderPage();
  };

  const mount = (container: HTMLElement) => {
    state.container = container;
    window.addEventListener("popstate", onPageChange);
    // Custom event triggered by `redirect`
    window.addEventListener("pushstate", onPageChange);
    renderPage();
  };

  const unmount = () => {
    window.removeEventListener("popstate", onPageChange);
    window.removeEventListener("pushstate", onPageChange);
    state.container.innerHTML = "";
    state.container = undefined;
  };

  return {
    mount,
    unmount,
  };
}
