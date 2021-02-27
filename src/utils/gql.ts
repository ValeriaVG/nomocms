import { parse } from "graphql";

const gql = (template: TemplateStringsArray, ...replacements: any[]) => {
  const gqlString = String.raw(template, ...replacements);
  try {
    return parse(gqlString);
  } catch (error) {
    // TODO: mark position
    console.error(gqlString);
    throw error;
  }
};
export default gql;
