import { html, attr } from "amp/lib";

const markdown = `
---
url: /
title: NoMoCMS
---

# NoMoCMS
In active development
`;

const sass = `
body{
  background:teal;
}
`;

export default html`
  <code-editor
    style="width:100%;height:100%;display:block;"
    value=${attr`${sass}`}
    language="css"
  >
  </code-editor>
`;
