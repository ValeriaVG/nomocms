import boilerplate from "amp/boilerplate";
import createRoutes from "utils/createRoutes";
import Pages from "./Pages";

const listPages = async (
  {
    parent,
    limit,
    offset,
  }: { parent?: number; limit?: number; offset?: number },
  { pages }: { pages: Pages }
) => {
  const items = await pages.find({
    where: { parent_id: parent || { is: "NULL" } },
    limit: limit || 10,
    offset: offset || 0,
  });
  return { items };
};

const previewPage = async ({ input }, { pages }: { pages: Pages }) => {
  const values = pages.parse(input);
  const result = await pages.render({ ...input, ...values }, true);
  const content = boilerplate({ ...result, url: "/_preview" });
  return { content, type: "amp" };
};

const routes = createRoutes("pages");
routes["/_api/pages"]["GET"] = listPages;
routes["/_api/page/preview"] = {
  POST: previewPage,
};

export default routes;
