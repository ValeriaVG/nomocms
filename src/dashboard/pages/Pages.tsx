import { faEye } from "@fortawesome/free-solid-svg-icons";
import Editor from "dashboard/components/Editor";
import ItemRoutes from "dashboard/ItemRoutes";
import FontAwesomeIcon from "dashboard/utils/FontAwesomeIcon";
import usePreview from "dashboard/utils/usePreview";
import useQuery from "dashboard/utils/useQuery";
import { ContentPage } from "modules/pages/types";

import * as Preact from "preact";

export default function Pages() {
  const { result } = useQuery("/templates");
  const options = result?.items ?? [];
  return (
    <ItemRoutes<ContentPage>
      name="Page"
      legend="Manage your pages and preview changes"
      defaultValue={{
        content: `
---
title: New page
path: /new-page
description: My new page
---
      
# New Page
      
Content here`,
        template: "tpl_1",
      }}
      columns={{
        title: { label: "Title" },
        path: {
          label: "Path",
        },
      }}
      renderForm={({ values, setValue, onValueChange }) => {
        const { togglePreview } = usePreview("/page/preview", values);
        return (
          <>
            <fieldset>
              <Editor value={values.content} onChange={setValue("content")} />
            </fieldset>
            <fieldset class="buttons" style="margin-left:auto;">
              <label>
                Template:
                <select
                  name="template"
                  placeholder="Choose template"
                  value={values.template}
                  onChange={onValueChange("template")}
                >
                  {options.map(({ id }) => (
                    <option value={id} default>
                      {id}
                    </option>
                  ))}
                </select>
              </label>
              <div class="button button-dark" onClick={togglePreview}>
                <FontAwesomeIcon icon={faEye} />
                Preview
              </div>
            </fieldset>
          </>
        );
      }}
    />
  );
}
