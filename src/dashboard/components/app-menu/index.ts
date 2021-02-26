import { html } from "amp/lib";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import api from "dashboard/utils/api";
export default class AppMenu extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = html`<ul></ul>`;
    this.loadList();
  }
  private async loadList() {
    const parent = this.getAttribute("parent");
    const query = parent ? `?parent=${parent}` : "";
    const menu = await api.get(`/_api/menu${query}`);
    for (let item of menu.items) {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<app-link to="/pages/${item.id}">${item.title}</app-link><app-menu parent="${item.id}"></app-menu>`;
      this.firstChild.appendChild(listItem);
    }
  }
}
