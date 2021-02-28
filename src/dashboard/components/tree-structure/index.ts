import { html } from "amp/lib";

export default class TreeStructure extends HTMLElement {
  constructor() {
    super();
    const template = document.createElement("template");
    template.innerHTML = html`
    <ul>
      <li><span><slot name="item"><slot></span></li>
    </ul>
    `;
  }
}
