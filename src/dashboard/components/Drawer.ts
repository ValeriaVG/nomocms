import { html } from "amp/lib";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { faCog, faCopy } from "@fortawesome/free-solid-svg-icons";
import styles from "./drawer.scss";

export default class Drawer extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = html`
      <div class="${styles.drawer}">
        <input
          type="search"
          placeholder="Search ..."
          class="${styles.search}"
        />
        <nav class="${styles.icons}">
          <ul>
            <li class="${styles.active}">${icon(faCopy).html}</li>
            <li>${icon(faCog).html}</li>
          </ul>
          <app-logo class="${styles["vertical-logo"]}" vertical></app-logo>
        </nav>
        <nav class="${styles.tree}"></nav>
      </div>
    `;
  }
}
