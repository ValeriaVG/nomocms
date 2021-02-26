import { redirect } from "dashboard/utils/router";

export default class AppLink extends HTMLElement {
  private link: HTMLAnchorElement;
  constructor() {
    super();
    this.link = document.createElement("a");
    const to = this.getAttribute("to") || this.getAttribute("href");
    this.link.setAttribute("href", to);
    this.childNodes.forEach((node) => {
      this.link.append(node);
    });
    this.appendChild(this.link);
    this.link.onclick = (e) => {
      e.preventDefault();
      to && redirect(to);
    };
  }
}
