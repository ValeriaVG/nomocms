import { GraphQLQuery } from "utils/gql";
import { apiURL } from "../config";

export function createApi(url: string) {
  const call = async (query: GraphQLQuery, variables?: Record<string, any>) => {
    const request: { query: string; variables?: Record<string, any> } = {
      query: query.text,
    };
    if (variables) request.variables = variables;
    try {
      const response = await window?.fetch(url, {
        mode: "cors",
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      const json = await response.json();
      return json;
    } catch (error) {
      console.error(error);
      return {
        errors: [error],
      };
    }
  };
  return { query: call, mutate: call, call };
}
const api = createApi(`${apiURL}/_api`);
export default api;
