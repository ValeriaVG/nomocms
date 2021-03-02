import { html, attr } from "amp/lib";
import styles from "./styles.scss";

//  Will be filled with custom elements names
const elements = new Set<string>();
window["_elements"] = elements;
require("../components");
document.body.innerHTML = html`
  <aside class="${styles.nav}">
    <nav>
      <ul>
        ${[...elements.values()]
          .map((element) => html`<li>${element}</li>`)
          .join("\n")}
      </ul>
    </nav>
  </aside>

  <main id="preview"></main>
  <code-editor id="editor" language="html"></code-editor>
`;
const preview = document.getElementById("preview");
const editor = document.getElementById("editor");
editor.addEventListener("change", (e: any) => {
  preview.innerHTML = e.detail.value;
});
document
  .querySelectorAll("nav>ul>li")
  .forEach((element: HTMLUListElement, i) => {
    const tag = element.textContent;
    const example = customElements.get(tag)._example ?? {
      parameters: {},
      content: "",
    };
    element.onclick = () => {
      const html = `<${tag} ${Object.entries(example.parameters).map(
        ([key, value]) => `${key}="${attr`${value}`}"`
      )}>${example.content}</${tag}>`;
      editor.setAttribute("value", html);
      preview.innerHTML = html;
    };
  });
