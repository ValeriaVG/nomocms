import { appUrl } from "config";
import { html } from "./lib";
export default ({
  body,
  head,
  style,
  url,
}: {
  body?: string;
  head?: string;
  style?: string;
  url: string;
}) => html`
  <!DOCTYPE html>
  <html ⚡ lang="en">
    <head>
      <meta charset="utf-8" />
      <script async src="https://cdn.ampproject.org/v0.js"></script>
      <link rel="canonical" href="${url}" />
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
      ${style && ["<" + "style amp-custom>", style, "</style>"].join("")}
      ${head ?? ""}
      <script
        async
        custom-element="amp-analytics"
        src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"
      ></script>
    </head>
    <body>
      ${body ?? ""}
      <amp-analytics>
        <script type="application/json">
          {
            "requests": {
              "event": "${appUrl ??
              ""}/_ping?event=${"$"}{eventId}&path=event=${"$"}{path}"
            },
            "triggers": {
              "trackPageview": {
                "on": "visible",
                "request": "event",
                "vars": {
                  "eventId": "pageview",
                  "path": "${url}"
                }
              }
            }
          }
        </script>
      </amp-analytics>
    </body>
  </html>
`;
