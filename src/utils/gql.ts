import { DocumentNode, parse } from "graphql";
export type GraphQLQuery = DocumentNode & { text: string };
const gql = (template: TemplateStringsArray, ...replacements: any[]) => {
  const gqlString = String.raw(template, ...replacements);
  try {
    const node = parse(gqlString);
    node["text"] = gqlString;
    return node as GraphQLQuery;
  } catch (error) {
    // TODO: mark position
    console.error(gqlString);
    throw error;
  }
};
export default gql;
