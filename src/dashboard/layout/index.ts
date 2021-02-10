import { html } from "amp/lib";
import styles from "./styles.scss";
export default (container: HTMLElement) => {
  container.innerHTML = html`
    <div class="${styles.wrapper}">
      <header class="${styles.header}"></header>
      <aside class="${styles.sidebar}">
        <app-drawer></app-drawer>
      </aside>
      <main class="${styles.main}"></main>
      <footer class="${styles.footer}"></footer>
    </div>
  `;

  return container.querySelector("main");
};
