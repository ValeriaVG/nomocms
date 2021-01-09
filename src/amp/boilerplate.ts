import { html } from "./lib";
export default ({
  body,
  head,
  style,
}: {
  body?: string;
  head?: string;
  style?: string;
}) => html`
  <!DOCTYPE html>
  <html ⚡ lang="en">
    <head>
      <meta charset="utf-8" />
      <script async src="https://cdn.ampproject.org/v0.js"></script>
      <link rel="canonical" href="http://localhost:8080" />
      <meta name="viewport" content="width=device-width" />
      <style amp-boilerplate>
        body {
          -webkit-animation: -amp-start 8s steps(1, end) 0s 1 normal both;
          -moz-animation: -amp-start 8s steps(1, end) 0s 1 normal both;
          -ms-animation: -amp-start 8s steps(1, end) 0s 1 normal both;
          animation: -amp-start 8s steps(1, end) 0s 1 normal both;
        }
        @-webkit-keyframes -amp-start {
          from {
            visibility: hidden;
          }
          to {
            visibility: visible;
          }
        }
        @-moz-keyframes -amp-start {
          from {
            visibility: hidden;
          }
          to {
            visibility: visible;
          }
        }
        @-ms-keyframes -amp-start {
          from {
            visibility: hidden;
          }
          to {
            visibility: visible;
          }
        }
        @-o-keyframes -amp-start {
          from {
            visibility: hidden;
          }
          to {
            visibility: visible;
          }
        }
        @keyframes -amp-start {
          from {
            visibility: hidden;
          }
          to {
            visibility: visible;
          }
        }
      </style>
      <noscript
        ><style amp-boilerplate>
          body {
            -webkit-animation: none;
            -moz-animation: none;
            -ms-animation: none;
            animation: none;
          }
        </style></noscript
      >
      ${style && ["<style amp-custom>", style, "</style>"].join("")}
      ${head ?? ""}
    </head>
    <body>
      ${body ?? ""}
    </body>
  </html>
`;
