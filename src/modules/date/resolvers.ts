import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";

export default {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date scalar type",
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.toISOString();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
        const date = new Date(ast.value);
        // Check that date is valid
        if (Number.isFinite(date.getTime())) return date;
      }
      return null;
    },
  }),
};
