import { html, attr } from "amp/lib";
import CodeEditor from "dashboard/components/code-editor";
import PagePreview from "dashboard/components/page-preview";
import layout from "dashboard/layout";
import api from "dashboard/utils/api";
import { deferred } from "dashboard/utils/functions";
import gql from "utils/gql";

const PAGE = gql`
  query($id: ID!) {
    page(id: $id) {
      content
    }
  }
`;
const UPDATE_PAGE = gql`
  mutation($id: ID!, $input: PageInput!) {
    updatePage(id: $id, input: $input) {
      id
    }
  }
`;
const CREATE_PAGE = gql`
  mutation($input: PageInput!) {
    createPage(input: $input) {
      id
    }
  }
`;

const PREVIEW_PAGE = gql`
  query($input: PageInput!) {
    pagePreview(input: $input)
  }
`;

const state: {
  codeEditor?: CodeEditor;
  pagePreview?: PagePreview;
  currentPreview?: string;
} = {};

const savePage = async (id?: string) => {
  const content = state.codeEditor.value;

  const result = await api.mutate(id ? UPDATE_PAGE : CREATE_PAGE, {
    id,
    input: { content },
  });
  console.debug(result);
};

const updatePreview = deferred(async () => {
  state.pagePreview.frame.setAttribute("src", "");
  const content = state.codeEditor.value;
  const result = await api.query(PREVIEW_PAGE, { input: { content } });
  if (!result.data) return;
  const url =
    URL.createObjectURL(
      new Blob([result.data.pagePreview], { type: "text/html" })
    ) + "#development=1";
  state.pagePreview.frame.setAttribute("src", url);
}, 500);

export default async ({ id }: { id?: string }) => {
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "s") savePage(id);
  };

  document.removeEventListener("keyup", onKeyUp);
  document.addEventListener("keyup", onKeyUp, true);

  if (!state.codeEditor || !state.pagePreview) {
    const { main, parameters } = layout(document.body);
    main.innerHTML = html`<code-editor
      language="markdown-extended"
    ></code-editor>`;
    parameters.innerHTML = html`<page-preview></page-preview>`;
    state.codeEditor = main.querySelector("code-editor");
    state.pagePreview = parameters.querySelector("page-preview");
  }
  state.codeEditor.onchange = () => {
    updatePreview(state.currentPreview !== id);
    state.currentPreview = id;
  };
  const result = await api.query(PAGE, { id });
  state.codeEditor!.setAttribute("value", result.data?.page.content ?? "");
};
