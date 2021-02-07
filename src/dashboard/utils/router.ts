import { Mountable } from "../types";

export default function createRouter(
  routes: Record<string, Mountable>,
  container: HTMLElement
) {
  const matchRoute = (
    path: string
  ): [page: Mountable | undefined, params: Record<string, string>] => {
    if (path in routes) return [routes[path], {}];
    return [routes["*"], {}];
  };

  const renderPage = () => {
    const path = document.location.pathname;
    const [page, params] = matchRoute(path);
    if (!page) return;
    if (typeof page === "string") return (container.innerHTML = page);
    page.render(container);
  };

  const onPageChange = (e) => {
    console.log("page changed");
    renderPage();
  };
  window.addEventListener("popstate", onPageChange);
  // Custom event triggered by <app-link/>
  window.addEventListener("pushstate", onPageChange);

  renderPage();
}
