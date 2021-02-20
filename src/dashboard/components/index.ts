import Logo from "./app-logo";
import Drawer from "./app-drawer";
import CodeEditor from "./code-editor";
import PagePreview from "./page-preview";

const defineElement = (name: string, customElement: typeof HTMLElement) => {
  // For live-reload
  if (customElements.get(name)) return customElements.upgrade(document.body);
  customElements.define(name, customElement);
};

defineElement("app-logo", Logo);
defineElement("app-drawer", Drawer);
defineElement("code-editor", CodeEditor);
defineElement("page-preview", PagePreview);
