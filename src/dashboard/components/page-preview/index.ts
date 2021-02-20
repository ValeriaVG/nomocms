import { html } from "amp/lib";

export default class PagePreview extends HTMLElement {
  frame: HTMLIFrameElement;
  constructor() {
    super();
    this.innerHTML = html`
      <iframe
        style="width:100%;height:100%;background:white;"
        frameborder="0"
      ></iframe>
    `;
    this.frame = this.querySelector("iframe");
    this.frame.setAttribute("src", "http://localhost:8080");
  }
}
