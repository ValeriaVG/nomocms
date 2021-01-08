import Editor from "dashboard/components/Editor";
import * as Preact from "preact";

export default function Home() {
  return (
    <>
      <h1>Editors</h1>
      <h2>Markdown Editor</h2>
      <section>
        <Editor
          value={`
---
title: Page
url: /
---
# Hello, Markdown

Looks like it works!
`}
        />
      </section>
      <h2>Styles Editor</h2>
      <section>
        <Editor
          language="css"
          value={`
body {
  background: red;
}
`}
        />
      </section>
      <h2>AMP Editor</h2>
      <section>
        <Editor
          language="html"
          theme="vs-dark"
          value={`
<amp-carousel
  width="450"
  height="300"
  layout="responsive"
  type="slides"
  role="region"
  aria-label="Basic carousel"
>
  <amp-img
    src="/static/inline-examples/images/image1.jpg"
    width="450"
    height="300"
  ></amp-img>
  <amp-img
    src="/static/inline-examples/images/image2.jpg"
    width="450"
    height="300"
  ></amp-img>
  <amp-img
    src="/static/inline-examples/images/image3.jpg"
    width="450"
    height="300"
  ></amp-img>
</amp-carousel>
`}
        />
      </section>
    </>
  );
}
