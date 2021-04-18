import { HTTPUserInputError } from "core/errors";
import { APIContext } from "core/types";
import { graphql } from "graphql";

const parseVariables = (value: string) => {
  if (!value) return;
  try {
    return JSON.parse(value);
  } catch {
    throw new HTTPUserInputError("variables", "Incorrect JSON");
  }
};

export default function GraphQL(schema) {
  return async (context: APIContext, params: any) => {
    const { query, operationName, variables } = {
      ...params.input,
      ...params,
    } as any;
    if (context.method === "OPTIONS" || context.method === "HEAD")
      return { code: 200, status: "OK" };

    const variableValues =
      typeof variables === "object" ? variables : parseVariables(variables);
    const response = await graphql({
      schema,
      contextValue: context,
      source: query,
      operationName,
      variableValues,
    });
    if ("errors" in response) {
      return { code: response.errors[0]?.extensions?.code ?? 400, response };
    }
    return response;
  };
}
