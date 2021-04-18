export const redirect = (to: string) => {
  history.pushState({ to }, "", to);
  window.dispatchEvent(new CustomEvent("pushstate", { detail: { to } }));
};
export const mount = (onPageChange: (e: Event) => void) => {
  window.addEventListener("popstate", onPageChange);
  window.addEventListener("pushstate", onPageChange);
};
export const unmount = (onPageChange: (e: Event) => void) => {
  window.removeEventListener("popstate", onPageChange);
  window.removeEventListener("pushstate", onPageChange);
};
