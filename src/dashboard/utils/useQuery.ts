import { ErrorResponse, JSONResponse, SimpleType } from "core/types";
import { useState, useEffect } from "preact/hooks";
import api from "./api";
export default function useQuery<T>(
  path: string,
  params?: Record<string, SimpleType>
) {
  const [state, setState] = useState<{
    result?: JSONResponse<T> | ErrorResponse;
    loading: boolean;
  }>({
    result: null,
    loading: path ? true : false,
  });
  const query = params
    ? "?" +
      Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join("&")
    : "";
  useEffect(() => {
    if (!path) return;
    setState({ loading: true });
    api
      .get(path + query)
      .then((result) => setState({ result, loading: false }));
  }, [path, query]);

  return state;
}
