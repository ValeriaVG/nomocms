import createRoutes from "utils/routes";
import { Containers, Mountable, Page } from "../types";

export const redirect = (to: string) => {
  history.pushState({ to }, "", to);
  window.dispatchEvent(new CustomEvent("pushstate", { detail: { to } }));
};

export default function createRouter(routes: Record<string, Page>) {
  const state: { containers?: Containers | HTMLElement; page?: Mountable } = {};
  const matchRoute = createRoutes(routes);
  const renderPage = () => {
    if (!state.containers) throw new Error("Router does not have a container");
    const path = document.location.pathname;
    const [page, params] = matchRoute(path);
    if (!page) return;
    const rootContainer: HTMLElement =
      "main" in state.containers ? state.containers.main : state.containers;
    if (typeof page === "string") return (rootContainer.innerHTML = page);
    if (state.page?.unmount) state.page.unmount(state.containers as Containers);
    if ("main" in state.containers && "mount" in page) {
      state.page = page;
      return page.mount(state.containers, params);
    }
    if ("render" in page) page.render(rootContainer, params);
  };

  const onPageChange = () => {
    renderPage();
  };

  const mount = (containers: Containers | HTMLElement) => {
    state.containers = containers;
    window.addEventListener("popstate", onPageChange);
    // Custom event triggered by `redirect`
    window.addEventListener("pushstate", onPageChange);
    renderPage();
  };

  const unmount = () => {
    window.removeEventListener("popstate", onPageChange);
    window.removeEventListener("pushstate", onPageChange);
    Object.values(state.containers).forEach((container) => {
      container.innerHTML = "";
    });
    state.containers = undefined;
  };

  return {
    mount,
    unmount,
  };
}
