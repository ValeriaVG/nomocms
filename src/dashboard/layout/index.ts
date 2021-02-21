import { html } from "amp/lib";
import { Containers } from "dashboard/types";
import styles from "./styles.scss";
const GRID_TEMPLATE_COLUMNS = "12rem 1fr 24rem";
const MIN_COLUMN = 12;

export default (container: HTMLElement): Containers => {
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
        <section></section>
      </aside>
    </div>
  `;

  const wrapper = container.querySelector(`.${styles.wrapper}`);
  const main = container.querySelector("main");
  const sidebar = container.querySelector(`.${styles.sidebar}`) as HTMLElement;
  const parameters = container.querySelector(
    `.${styles.parameters}>section`
  ) as HTMLElement;
  container
    .querySelectorAll(`.${styles.splitter}`)
    .forEach((element: HTMLElement, i: number) =>
      setupSplitter(element, wrapper as HTMLElement, i === 0, () =>
        main.dispatchEvent(new CustomEvent("resize"))
      )
    );
  return { main, sidebar, parameters };
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

  const onDragEvent = (started: boolean) => () => {
    state.isDragging = started;
    element.classList[started ? "add" : "remove"](styles.resizing);
    const action = started ? "addEventListener" : "removeEventListener";
    ["mouseup", "touchend", "touchcancel", "mouseleave"].forEach((event) =>
      window[action](event, onDragStop)
    );
    ["mousemove", "touchmove"].forEach((event) =>
      window[action](event, onDrag, { passive: true })
    );
  };

  const onDragStart = onDragEvent(true);
  const onDragStop = onDragEvent(false);

  handler.draggable = false;
  handler.addEventListener("mousedown", onDragStart);
  handler.addEventListener("touchstart", onDragStart, { passive: true });
};
