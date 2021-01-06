import { html } from "amp/lib";
import editor from "./editor";

export default {
  "/": () => ({
    type: "amp",
    body: html`<amp-iframe
      sandbox="allow-scripts"
      layout="responsive"
      width="200"
      height="105"
      frameborder="0"
      src="/editor"
    >
      <amp-img
        layout="responsive"
        width="205"
        height="105"
        src="https://dev-to-uploads.s3.amazonaws.com/i/549eomjatt5yl9vfh1n7.jpg"
        placeholder
      ></amp-img>
    </amp-iframe>`,
    head:
      '<script async custom-element="amp-iframe" src="https://cdn.ampproject.org/v0/amp-iframe-0.1.js"></script>',
  }),
  "/editor": () => ({
    type: "html",
    data: editor,
  }),
};
