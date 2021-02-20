import Logo from "./logo";
import Drawer from "./app-drawer";
import CodeEditor from "./code-editor";
import PagePreview from "./page-preview";
try {
  customElements.define("app-logo", Logo);
  customElements.define("app-drawer", Drawer);
  customElements.define("code-editor", CodeEditor);
  customElements.define("page-preview", PagePreview);
} catch (_) {}
