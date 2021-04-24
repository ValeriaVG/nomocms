import { html, attr } from "amp/lib";
import layout from "dashboard/layout";
import api from "dashboard/utils/api";
import gql from "utils/gql";

const PAGE = gql`
  query($id: ID!) {
    page(id: $id) {
      content
    }
  }
`;
const state: { codeEditor?: HTMLElement; pagePreview?: HTMLElement } = {};
export default async ({ id }: { id: string }) => {
  if (!state.codeEditor || !state.pagePreview) {
    const { main, parameters } = layout(document.body);
    main.innerHTML = html`<code-editor
      language="markdown-extended"
    ></code-editor>`;
    parameters.innerHTML = html`<page-preview></page-preview>`;
    state.codeEditor = main.querySelector("code-editor");
    state.pagePreview = parameters.querySelector("page-preview");
  }
  const result = await api.query(PAGE, { id });
  state.codeEditor!.setAttribute("value", result.data?.page.content ?? "");
};
