import Editor from "dashboard/components/Editor";
import ItemRoutes from "dashboard/ItemRoutes";
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
      renderForm={({ values, setValue, onValueChange }) => (
        <>
          <fieldset>
            <Editor value={values.content} onChange={setValue("content")} />
          </fieldset>
          <fieldset style="max-width:320px;margin-left:auto;">
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
          </fieldset>
        </>
      )}
    />
  );
}
