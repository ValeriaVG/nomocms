import { html } from "amp/lib";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { faCog, faCopy } from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.scss";
export default class AppDrawer extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = html`
      <div class="${styles.drawer}">
        <nav class="${styles.icons}">
          <ul>
            <li class="${styles.active}">${icon(faCopy).html}</li>
            <li>${icon(faCog).html}</li>
          </ul>
          <app-logo class="${styles["vertical-logo"]}" vertical></app-logo>
        </nav>
        <nav class="${styles.tree}">
          <input
            type="search"
            placeholder="Search ..."
            class="${styles.search}"
          />
          <app-menu></app-menu>
        </nav>
      </div>
    `;
  }
}
