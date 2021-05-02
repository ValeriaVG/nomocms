import { html } from "amp/lib";
import api from "dashboard/utils/api";
import gql from "utils/gql";

const GET_TREE = gql`
  {
    pages {
      items {
        id
        path
        title
        code
        children {
          items {
            id
            path
            title
            code
          }
        }
      }
    }
  }
`;
type Item = {
  id: number;
  path: string;
  title: string;
  code: number;
  children: { items: Item[] };
};
export default class AppMenu extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = html` <input type="search" placeholder="Search ..." /> `;
    const tree = await api.query(GET_TREE);
    this.attachTree(tree.data.pages.items, this);
  }
  attachTree(items: Item[], element: HTMLElement) {
    const ul = document.createElement("ul");
    for (let item of items) {
      const li = document.createElement("li");
      const link = document.createElement("app-link");
      link.setAttribute("to", `/pages/${item.id}`);
      link.innerText = item.title;
      li.appendChild(link);
      //if (item.children.items.length) this.attachTree(item.children.items, li);
      ul.appendChild(li);
    }
    element.appendChild(ul);
  }
}
