import Logo from "./app-logo";
import CodeEditor from "./code-editor";
import PagePreview from "./page-preview";
import TreeStructure from "./tree-structure";
import AppLink from "./app-link";

const defineElement = (name: string, customElement: typeof HTMLElement) => {
  // For preview sink
  if (typeof window["_elements"] === "object") window["_elements"].add(name);
  // For live-reload
  if (customElements.get(name)) return customElements.upgrade(document.body);
  customElements.define(name, customElement);
};

defineElement("app-logo", Logo);
defineElement("app-link", AppLink);
defineElement("tree-structure", TreeStructure);
defineElement("code-editor", CodeEditor);
defineElement("page-preview", PagePreview);
