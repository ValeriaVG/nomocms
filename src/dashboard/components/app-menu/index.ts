import { html } from "amp/lib";
import api from "dashboard/utils/api";
import gql from "utils/gql";

const PAGES = gql`
  query($parent: ID, $limit: Int, $offset: Int) {
    pages(parent: $parent, limit: $limit, offset: $offset) {
      items {
        id
        title
      }
      total
      nextOffset
    }
  }
`;
export default class AppMenu extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = html`<ul></ul>`;
    this.loadList();
  }
  private async loadList() {
    const parent = this.getAttribute("parent");
    const menu = await api.query(PAGES, { parent });
    const items = menu?.data?.pages.items ?? [];
    for (let item of items) {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<app-link to="/pages/${item.id}">${item.title}</app-link><app-menu parent="${item.id}"></app-menu>`;
      this.firstChild.appendChild(listItem);
    }
  }
}
