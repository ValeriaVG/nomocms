import { html } from "amp/lib";
import styles from "./styles.scss";
export default class PagePreview extends HTMLElement {
  frame: HTMLIFrameElement;
  connectedCallback() {
    this.classList.add(styles.preview);
    this.innerHTML = html`
      <iframe class="${styles.frame}" frameborder="0"></iframe>
    `;
    this.frame = this.querySelector("iframe");
    this.frame.setAttribute("src", "http://localhost:8080");
  }
}
