import Editor from "dashboard/components/Editor";
import Tabs from "dashboard/components/Tabs";
import ItemRoutes from "dashboard/ItemRoutes";
import api from "dashboard/utils/api";
import useNotification from "dashboard/utils/notifications";
import { TemplateData } from "modules/templates/types";
import * as Preact from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

// IDEA: add components
export default function Templates() {
  return (
    <ItemRoutes<TemplateData>
      name="Template"
      legend="Manage your website design with live preview"
      columns={{
        id: { label: "ID" },
        style: {
          label: "Style",
        },
      }}
      defaultValue={{
        id: "page-template",
        style: "body{background: teal}",
        head:
          '<script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.2.js"></script>',
        body: `<amp-carousel
  width="450"
  height="300"
  layout="responsive"
  type="slides"
  role="region"
  aria-label="Basic carousel"
>
  <amp-img
    src="https://picsum.photos/200/300?random=1"
    width="200"
    height="300"
  ></amp-img>
  <amp-img
    src="https://picsum.photos/200/300?random=2"
    width="200"
    height="300"
  ></amp-img>
  <amp-img
    src="https://picsum.photos/200/300?random=3"
    width="200"
    height="300"
  ></amp-img>
</amp-carousel>`,
      }}
      renderForm={TemplateForm}
    />
  );
}

const TemplateForm = ({ values, setValue, onValueChange }) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [tab, setTab] = useState<"body" | "head" | "style">("body");
  const { showErrors } = useNotification();
  useEffect(() => {
    api.post("/template/preview", values).then((r) => {
      if (typeof r === "object") return showErrors(r.errors);
      const url = URL.createObjectURL(new Blob([r], { type: "text/html" }));
      setPreviewUrl(url);
    });
  }, [values]);
  return (
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
      </fieldset>

      <Tabs
        active={tab}
        labels={{
          body: "Body",
          head: "Head",
          style: "Style",
        }}
        onChangeTab={setTab}
      />
      <fieldset class="columns" style={{ flex: 1 }}>
        {tab === "body" && (
          <Editor
            theme="vs-dark"
            value={values.body}
            language="html"
            onChange={setValue("body")}
            style={{ height: "calc(100vh - 350px)" }}
          />
        )}
        {tab === "head" && (
          <Editor
            theme="vs-dark"
            value={values.head}
            language="html"
            onChange={setValue("head")}
            style={{ height: "calc(100vh - 350px)" }}
          />
        )}
        {tab === "style" && (
          <Editor
            theme="vs-dark"
            value={values.style}
            language="scss"
            onChange={setValue("style")}
            style={{ height: "calc(100vh - 350px)" }}
          />
        )}
        {previewUrl && (
          <iframe
            id="preview"
            src={previewUrl + "#development=1"}
            frameBorder="0"
            width="100%"
            height="100%"
          />
        )}
      </fieldset>
    </>
  );
};
