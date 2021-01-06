import { html } from "amp/lib";

export default html`
  <!DOCTYPE html>
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
      <style type="text/css">
        html,
        body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      </style>
    </head>
    <body>
      <div id="container" style="width: 100%; height: 100%"></div>
      <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.21.2/min/vs/loader.js"></script>
      <script>
        require.config({
          paths: {
            vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.21.2/min/vs",
          },
        });
        require(["vs/editor/editor.main"], function () {
          var editor = monaco.editor.create(
            document.getElementById("container"),
            {
              value: "background{color:red};",
              language: "css",
            }
          );
          window.onresize = function () {
            editor.layout();
          };
          window.parent.postMessage(
            {
              sentinel: "amp",
              type: "embed-ready",
            },
            "*"
          );
        });
      </script>
    </body>
  </html>
`;
