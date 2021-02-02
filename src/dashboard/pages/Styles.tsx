import Editor from "dashboard/components/Editor";
import ItemRoutes from "dashboard/ItemRoutes";
import { StyleData } from "modules/styles/Styles";

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
              className="copy-me"
              readOnly
              value={`@import "${id}";`}
              style={{ width: "auto" }}
            />
          ),
        },
        data: { label: "Styles" },
      }}
      defaultValue={{
        id: "template-style",
        source: `.template-class{\n\n}`,
      }}
      renderForm={({ values, setValue, onValueChange, update }) => (
        <>
          <fieldset style={{ maxWidth: 320, marginRight: "auto" }}>
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
              value={values.source}
              language="scss"
              onChange={setValue("source")}
            />
          </fieldset>
        </>
      )}
    />
  );
}
