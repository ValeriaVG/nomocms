import Editor from "dashboard/components/Editor";
import ItemRoutes from "dashboard/ItemRoutes";
import { TemplateData } from "modules/templates/types";
import * as Preact from "preact";

// IDEA: add components
export default function Templates() {
  return (
    <ItemRoutes<TemplateData>
      name="Template"
      columns={{
        id: { label: "ID" },
        style: {
          label: "Style",
        },
      }}
      defaultValue={{
        id: "page-template",
        body: `<amp-carousel
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
</amp-carousel>`,
      }}
      renderForm={({ values, setValue, onValueChange }) => (
        <>
          <fieldset className="columns small">
            <label>
              ID:
              <input
                type="text"
                name="id"
                value={values.id}
                onChange={onValueChange("id")}
              />
            </label>

            <label>
              Style:
              <select
                name="style"
                required
                value={values.style}
                onChange={onValueChange("style")}
              >
                <option value="style_1" default>
                  Style 1
                </option>
                <option value="style_2">Style 2</option>
                <option value="style_3">Style 3</option>
              </select>
            </label>
          </fieldset>

          <div class="columns">
            <div>
              <h2>Body</h2>
              <fieldset>
                <Editor
                  theme="vs-dark"
                  value={values.body}
                  language="html"
                  onChange={setValue("body")}
                />
              </fieldset>
            </div>
            <div>
              <h2>Head</h2>
              <fieldset>
                <Editor
                  theme="vs-dark"
                  value={values.head}
                  language="html"
                  onChange={setValue("head")}
                />
              </fieldset>
            </div>
          </div>
        </>
      )}
    />
  );
}
