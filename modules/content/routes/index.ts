import {
  createPage,
  deletePage,
  getPage,
  listPages,
  previewPage,
  updatePage,
} from "./content";

export default {
  "/content": {
    POST: createPage,
    GET: listPages,
  },
  "/content/:id": {
    GET: getPage,
    PUT: updatePage,
    DELETE: deletePage,
  },
  "/content/preview": {
    POST: previewPage,
  },
};
