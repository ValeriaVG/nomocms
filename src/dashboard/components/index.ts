import Logo from "./app-logo";
import Drawer from "./app-drawer";
import CodeEditor from "./code-editor";
import PagePreview from "./page-preview";
import AppMenu from "./app-menu";
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
defineElement("app-drawer", Drawer);
defineElement("app-menu", AppMenu);
defineElement("code-editor", CodeEditor);
defineElement("page-preview", PagePreview);
