import * as monaco from "monaco-editor";

export default class Editor extends HTMLElement {
  constructor() {
    super();
    const value = this.getAttribute("value");
    this.style.backgroundColor = "#100818";
    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (mutation.type === "attributes") this.updateEditorOptions();
      });
    });
    monaco.editor.defineTheme("vs-nomo", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.foreground": "#ffffff",
        "editor.background": "#100818",
      },
    });
    monaco.editor.create(this, {
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
  }
  getOptions = () => {
    return {
      language: this.getAttribute("language") || "markdown",
      value: this.getAttribute("value") || "",
    };
  };
  updateEditorOptions() {
    console.log("editor options");
    console.log(this.getOptions());
  }
}
