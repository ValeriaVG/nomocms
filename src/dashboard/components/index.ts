import Logo from "./logo";
import Drawer from "./Drawer";
import Editor from "./Editor";
try {
  customElements.define("app-logo", Logo);
  customElements.define("app-drawer", Drawer);
  customElements.define("code-editor", Editor);
} catch (_) {}
