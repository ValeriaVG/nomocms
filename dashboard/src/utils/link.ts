import { pathStore } from "../stores";
export const onLinkClicked = (e: MouseEvent) => {
  e.preventDefault();
  const link = e.target as HTMLAnchorElement;
  window.history.pushState({}, link.title || "", link.href);
  pathStore.set(link.href);
};
