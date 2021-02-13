import { html } from "amp/lib";
import styles from "./styles.scss";
export default (container: HTMLElement) => {
  container.innerHTML = html`
    <div class="${styles.wrapper}">
      <aside class="${styles.sidebar}">
        <app-drawer></app-drawer>
      </aside>
      <main class="${styles.main}"></main>
      <aside class="${styles.parameters}"></aside>
    </div>
  `;

  makeResizable(container.querySelector("." + styles.sidebar));
  return container.querySelector("main");
};

export function makeResizable(element: HTMLElement) {
  element.style.position = "relative";
  const handle = document.createElement("button");
  handle.setAttribute("class", styles["resize-handle"]);
  element.appendChild(handle);
  const state = {
    isResizing: false,
  };
  handle.addEventListener("mousedown", () => {
    document.body.style.cursor = "ew-resize";
    state.isResizing = true;
  });
  document.addEventListener("mouseup", () => {
    state.isResizing = false;
    document.body.style.cursor = null;
  });
  document.addEventListener("mousemove", (e) => {
    if (!state.isResizing) return;
    // const width = e.pageX - element.offsetLeft;
    // element.style.width = `${width}px`;
  });
}
