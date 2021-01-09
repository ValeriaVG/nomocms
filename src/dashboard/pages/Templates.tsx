import Editor from "dashboard/components/Editor";
import ItemRoutes from "dashboard/ItemRoutes";
import { StyleData } from "modules/styles/Styles";
import * as Preact from "preact";

// TODO: add components
export default function Templates() {
  return (
    <ItemRoutes<StyleData>
      name="Template"
      columns={{
        id: { label: "ID" },
        style: {
          label: "Style",
        },
      }}
      defaultValue={{
        id: "page-template",
        data: `<amp-carousel
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
          <fieldset style="max-width:320px;margin-right:auto;">
            <label>
              ID:
              <input
                type="text"
                name="id"
                value={values.id}
                onChange={onValueChange("id")}
              />
            </label>
          </fieldset>

          <fieldset>
            <Editor
              theme="vs-dark"
              value={values.data}
              language="html"
              onChange={setValue("data")}
            />
          </fieldset>
        </>
      )}
    />
  );
}
