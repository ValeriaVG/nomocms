import { faPlus, faSave } from "@fortawesome/free-solid-svg-icons";
import BreadCrumbs from "dashboard/components/BreadCrumbs";
import Editor from "dashboard/components/Editor";
import api from "dashboard/utils/api";
import FontAwesomeIcon from "dashboard/utils/FontAwesomeIcon";
import useForm from "dashboard/utils/useForm";
import { ContentPage } from "modules/pages/types";
import * as Preact from "preact";
import { Link } from "react-router-dom";
const defaultPage = {
  content: `
---
title: New page
path: /new-page
description: My new page
---

# New Page

Content here
`,
  template: "tpl_1",
};

export default function Page() {
  const { values, setValue, onValueChange } = useForm<Partial<ContentPage>>(
    defaultPage
  );
  const onSubmit = async (e) => {
    e.preventDefault();

    const result = await api.post("/pages", values);
    console.log(result);
  };
  return (
    <form method="POST" action="/pages" onSubmit={onSubmit}>
      <header>
        <div>
          <BreadCrumbs
            path={[
              {
                to: "/pages",
                label: "Pages",
              },
              {
                label: "New Page",
              },
            ]}
          />
          <h1>New page</h1>
        </div>
        <div class="buttons">
          <Link to="/pages" className="button-secondary" type="cancel">
            Cancel
          </Link>
          <button class="button-primary" type="submit">
            <FontAwesomeIcon icon={faSave} />
            Save
          </button>
        </div>
      </header>

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
    </form>
  );
}
