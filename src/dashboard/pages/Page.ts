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

export default async ({ id }: { id: string }) => {
  const { main, parameters } = layout(document.body);
  const result = await api.query(PAGE, { id });
  main.innerHTML = html`<code-editor
    value=${attr`${result.data.page?.content ?? ""}`}
  >
  </code-editor>`;
  parameters.innerHTML = html`<page-preview></page-preview>`;
};
