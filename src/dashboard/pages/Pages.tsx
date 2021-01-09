import Editor from "dashboard/components/Editor";
import ItemRoutes from "dashboard/ItemRoutes";
import { ContentPage } from "modules/pages/types";

import * as Preact from "preact";

export default function Pages() {
  return (
    <ItemRoutes<ContentPage>
      name="Page"
      legend="Manage your pages &amp; preview changes"
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
                required
                value={values.template}
                onChange={onValueChange("template")}
              >
                <option value="tpl_1" default>
                  Template 1
                </option>
                <option value="tpl_2">Template 2</option>
                <option value="tpl_3">Template 3</option>
              </select>
            </label>
          </fieldset>
          <fieldset style="max-width:320px;margin-left:auto;">
            <label>
              Published:
              <input
                type="date"
                name="publishedAt"
                value={values.publishedAt}
                onChange={onValueChange("publishedAt")}
              />
            </label>
          </fieldset>
        </>
      )}
    />
  );
}
