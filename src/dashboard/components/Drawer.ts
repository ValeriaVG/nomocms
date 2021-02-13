import { html } from "amp/lib";
import { icon } from "@fortawesome/fontawesome-svg-core";
import {
  faAngleDown,
  faAngleRight,
  faCog,
  faCopy,
  faExclamationCircle,
  faFile,
  faFileAlt,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./drawer.scss";

export default class Drawer extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = html`
      <div class="${styles.drawer}">
        <nav class="${styles.icons}">
          <ul>
            <li class="${styles.active}">${icon(faCopy).html}</li>
            <li>${icon(faCog).html}</li>
          </ul>
          <app-logo class="${styles["vertical-logo"]}" vertical></app-logo>
        </nav>
        <nav class="${styles.tree}">
          <input
            type="search"
            placeholder="Search ..."
            class="${styles.search}"
          />
          <ul>
            <li>
              <a><span>${icon(faHome).html}</span> Home Page</a>
            </li>
            <li>
              <a><span>${icon(faAngleRight).html}</span> Folder</a>
            </li>
            <li>
              <a><span>${icon(faAngleDown).html}</span> Open</a>
              <ul>
                <li><a>Page 1</a></li>
                <li><a>Page 2</a></li>
                <li><a>Page 3</a></li>
                <li><a>Page 4</a></li>
                <li><a>Page 5</a></li>
                <li><a>Show all</a></li>
              </ul>
            </li>
            <li>
              <a><span>${icon(faFile).html}</span> About</a>
            </li>
            <li>
              <a><span>${icon(faFile).html}</span> Contact</a>
            </li>
            <li>
              <a
                ><span>${icon(faExclamationCircle).html}</span> Page Not
                Found</a
              >
            </li>
          </ul>
        </nav>
      </div>
    `;
  }
}
