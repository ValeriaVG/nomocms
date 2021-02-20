import * as monaco from "monaco-editor";
import {
  language as markdownLanguage,
  conf as markdownConfig,
} from "./markdown.config";

monaco.editor.defineTheme("vs-nomo", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.foreground": "#ffffff",
    "editor.background": "#100818",
  },
});
monaco.languages.register({
  id: "markdown-extended",
});
monaco.languages.setLanguageConfiguration("markdown-extended", markdownConfig);
monaco.languages.setMonarchTokensProvider(
  "markdown-extended",
  markdownLanguage
);
export default class CodeEditor extends HTMLElement {
  private editor: monaco.editor.IStandaloneCodeEditor;

  constructor() {
    super();
    this.style.width = "100%";
    this.style.height = "100%";
    this.style.display = "block";
    this.style.overflow = "hidden";
    this.style.backgroundColor = "#100818";
    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (mutation.type === "attributes")
          return this.updateEditorOptions(mutation.attributeName);
      });
    });

    this.editor = monaco.editor.create(this, {
      theme: "vs-nomo",
      automaticLayout: true,
      minimap: { enabled: false },
      scrollbar: {
        vertical: "auto",
        horizontal: "auto",
      },
      ...this.getOptions(),
    });
    observer.observe(this, { attributes: true });

    document.querySelector("main")?.addEventListener("resize", () => {
      this.editor.layout();
    });
  }
  getOptions = () => {
    return {
      language: this.getAttribute("language") || "markdown-extended",
      value: this.getAttribute("value") || "",
    };
  };
  updateEditorOptions(attribute) {
    const { value, language } = this.getOptions();
    if (attribute === "value") {
      this.editor.setValue(value);
    }
    if (attribute === "language") {
      monaco.editor.setModelLanguage(this.editor.getModel(), language);
    }
  }
}
