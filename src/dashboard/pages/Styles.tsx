import Editor from "dashboard/components/Editor";
import ItemRoutes from "dashboard/ItemRoutes";
import { StyleData } from "modules/styles/Styles";
import * as Preact from "preact";

export default function Styles() {
  return (
    <ItemRoutes<StyleData>
      name="Style"
      columns={{
        id: { label: "ID" },
        templates: {
          label: "Templates",
        },
      }}
      defaultValue={{
        id: "template-style",
        data: `.template-class{\n\n}`,
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
              language="css"
              onChange={setValue("data")}
            />
          </fieldset>
        </>
      )}
    />
  );
}
