import { html } from "amp/lib";
import styles from "./styles.scss";
const GRID_TEMPLATE_COLUMNS = "12rem 1fr 24rem";
const MIN_COLUMN = 12;

export default (container: HTMLElement) => {
  container.innerHTML = html`
    <div
      class="${styles.wrapper}"
      style="grid-template-columns:${GRID_TEMPLATE_COLUMNS}"
    >
      <aside class="${styles.sidebar}">
        <app-drawer></app-drawer>
        <div class="${styles.splitter}" style="right:0"></div>
      </aside>
      <main class="${styles.main}"></main>
      <aside class="${styles.parameters}">
        <div class="${styles.splitter}" style="left:0"></div>
        <!-- parameters -->
      </aside>
    </div>
  `;

  const wrapper = container.querySelector(`.${styles.wrapper}`);
  const main = container.querySelector("main");
  container
    .querySelectorAll(`.${styles.splitter}`)
    .forEach((element: HTMLElement, i: number) =>
      setupSplitter(element, wrapper as HTMLElement, i === 0, () =>
        main.dispatchEvent(new CustomEvent("resize"))
      )
    );
  return main;
};

const setupSplitter = (
  handler: HTMLElement,
  element: HTMLElement,
  left: boolean,
  onResize: () => void
) => {
  const state = {
    isDragging: false,
  };

  const onDrag = (e: MouseEvent | TouchEvent) => {
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const sizes = element.style.gridTemplateColumns.split(" ");
    if (left) sizes[0] = Math.max(x, MIN_COLUMN) + "px";
    else sizes[2] = Math.max(element.clientWidth - x, MIN_COLUMN) + "px";
    element.style.gridTemplateColumns = sizes.join(" ");
    onResize();
  };

  const onDragStop = () => {
    state.isDragging = false;

    window.removeEventListener("mouseup", onDragStop);
    window.removeEventListener("touchend", onDragStop);
    window.removeEventListener("touchcancel", onDragStop);
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("touchmove", onDrag);
  };
  const onDragStart = (e: MouseEvent) => {
    state.isDragging = true;

    window.addEventListener("mouseup", onDragStop);
    window.addEventListener("touchend", onDragStop);
    window.addEventListener("touchcancel", onDragStop);
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("touchmove", onDrag);
  };

  handler.draggable = false;
  handler.addEventListener("mousedown", onDragStart);
  handler.addEventListener("touchstart", onDragStart);
};
