import { APIContext } from "core/types";
import { graphql } from "graphql";

export default function GraphQL(schema) {
  return (context: APIContext, params: any) => {
    const { query, operationName } = params;
    return graphql({
      schema,
      contextValue: context,
      source: query,
      operationName,
    });
  };
}
