import Editor from "dashboard/components/Editor";
import ItemRoutes from "dashboard/ItemRoutes";
import { StyleData } from "modules/styles/Styles";
import * as Preact from "preact";

export default function Styles() {
  return (
    <ItemRoutes<StyleData>
      name="Style"
      legend={
        <>
          Create reusable styles and simply <strong>@import</strong> them by ID
          in template styles
        </>
      }
      columns={{
        id: { label: "ID" },
        import: {
          label: "Import",
          render: ({ id }) => (
            <input
              type="text"
              class="copy-me"
              readOnly
              value={`@import "${id}";`}
              style="width:auto"
            />
          ),
        },
        data: { label: "Styles" },
      }}
      defaultValue={{
        id: "template-style",
        data: `.template-class{\n\n}`,
      }}
      renderForm={({ values, setValue, onValueChange, update }) => (
        <>
          <fieldset style="max-width:320px;margin-right:auto;">
            <label>
              ID:
              <input
                type="text"
                name="id"
                readOnly={update}
                value={values.id}
                onChange={onValueChange("id")}
              />
            </label>
          </fieldset>

          <fieldset>
            <Editor
              theme="vs-dark"
              value={values.data}
              language="css"
              onChange={setValue("data")}
            />
          </fieldset>
        </>
      )}
    />
  );
}
