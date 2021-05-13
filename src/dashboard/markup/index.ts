import { html } from "amp/lib";
import "../styles.scss";
import styles from "./styles.scss";

import { icon } from "@fortawesome/fontawesome-svg-core";
import {
  faCopy,
  faPaintRoller,
  faUsers,
  faThLarge,
  //faTimes,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import "../components";

export default html`
  <div class="${styles.wrapper}">
    <header class="${styles.header}">
      <nav class="${styles.tabs}">
        <ul>
          <li class="${styles.active}">
            <a href="#"
              >Home Page
              <span style="font-size:0.5rem">${icon(faCircle).html}</span></a
            >
          </li>
          <li><a href="#">Template: Article</a></li>
          <li><a href="#">Style: Article</a></li>
        </ul>
      </nav>
    </header>
    <aside class="${styles.aside}">
      <nav class="${styles.navigation}">
        <ul>
          <li><a href="#" title="Pages">${icon(faCopy).html}</a></li>
          <li><a href="#" title="Templates">${icon(faThLarge).html}</a></li>
          <li><a href="#" title="Styles">${icon(faPaintRoller).html}</a></li>
          <li><a href="#" title="Users">${icon(faUsers).html}</a></li>
        </ul>
        <section class="${styles["menu-bottom"]}">
          <app-logo vertical></app-logo>
          <ul>
            <li><a href="#" title="Profile" class="${styles.avatar}">VG</a></li>
          </ul>
        </section>
      </nav>
      <section class="${styles.items}">
        <input type="search" placeholder="Search..." />
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li>
            <a href="#">Blog</a>
            <ul>
              <li><a href="#">Article</a></li>
              <li><a href="#">Another Article</a></li>
              <li><a href="#">Older Article</a></li>
              <li><a href="#">Oldest Article</a></li>
              <li><a href="#">All articles</a></li>
            </ul>
          </li>
          <li><a href="#">Not Found</a></li>
        </ul>
      </section>
    </aside>
    <main>
      <code-editor
        language="markdown-extended"
        value="---
path:/
---
#Hello!

"
      ></code-editor>
    </main>
  </div>
`;
