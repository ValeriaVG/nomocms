import { parse } from "graphql";

const gql = (template: TemplateStringsArray, ...replacements: any[]) => {
  const qqlString = String.raw(template, ...replacements);
  return parse(qqlString);
};
export default gql;
