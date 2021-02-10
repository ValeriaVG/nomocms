import { html } from "amp/lib";
import { icon } from "@fortawesome/fontawesome-svg-core";
import {
  faFileAlt,
  faLayerGroup,
  faPaintBrush,
} from "@fortawesome/free-solid-svg-icons";
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
            <li class="${styles.active}">${icon(faFileAlt).html}</li>
            <li>${icon(faLayerGroup).html}</li>
            <li>${icon(faPaintBrush).html}</li>
          </ul>
        </nav>
        <nav class="${styles.tree}"></nav>
      </div>
    `;
  }
}
