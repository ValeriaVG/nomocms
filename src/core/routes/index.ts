import schema from "core/graphql/schema";
import createRoutes from "utils/routes";
import handleContent from "./content";
import handleGraphQL from "./graphql";
import health from "./health";
import handleSitemap from "./sitemap";

export default createRoutes({
  "/_api": handleGraphQL(schema),
  "/_health": health,
  "/sitemap.xml": handleSitemap,
  "/*": handleContent,
});
