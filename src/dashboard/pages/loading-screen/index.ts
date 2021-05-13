import { icon } from "@fortawesome/fontawesome-svg-core";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { html } from "amp/lib";
import styles from "./styles.scss";

export default class LoadingScreen extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html`<div class="${styles.loading}">
      ${icon(faSpinner, { classes: ["fa-spin"] }).html}
    </div>`;
  }
}
