import * as monaco from "monaco-editor";

export default class Editor extends HTMLElement {
  constructor() {
    super();
    const value = this.innerHTML;
    this.innerHTML = "";
    this.style.backgroundColor = "#100818";
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
      value,
      language: "markdown",
      automaticLayout: true,
      minimap: { enabled: false },
      scrollbar: {
        vertical: "auto",
        horizontal: "auto",
      },
    });
  }
}
