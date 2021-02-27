import GraphQL from "./graphql";
import schema from "./schema";
export default {
  "/_api": GraphQL(schema),
};
