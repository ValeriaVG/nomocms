import { makeExecutableSchema } from "@graphql-tools/schema";
import modules from "modules";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";

export default makeExecutableSchema({
  typeDefs: mergeTypeDefs(modules.typeDefs),
  resolvers: mergeResolvers(modules.resolvers),
  directiveResolvers: mergeResolvers(modules.directiveResolvers),
});
