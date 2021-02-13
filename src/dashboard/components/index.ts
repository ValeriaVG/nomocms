import Logo from "./logo";
import Drawer from "./app-drawer";
import CodeEditor from "./code-editor";
try {
  customElements.define("app-logo", Logo);
  customElements.define("app-drawer", Drawer);
  customElements.define("code-editor", CodeEditor);
} catch (_) {}
