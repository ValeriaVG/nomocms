import { defineElements } from "dashboard/utils/elements";

import Logo from "./app-logo";
import CodeEditor from "./code-editor";
import PagePreview from "./page-preview";
import AppMenu from "./app-menu";
import AppLink from "./app-link";
import SnackBar from "./snack-bar";

defineElements({
  "app-logo": Logo,
  "app-link": AppLink,
  "app-menu": AppMenu,
  "code-editor": CodeEditor,
  "page-preview": PagePreview,
  "snack-bar": SnackBar,
});
