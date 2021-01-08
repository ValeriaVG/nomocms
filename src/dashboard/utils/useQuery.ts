import { ErrorResponse, JSONResponse, SimpleTypes } from "core/types";
import { useState, useEffect } from "preact/hooks";
import api from "./api";
export default function useQuery<T>(
  path: string,
  params?: Record<string, SimpleTypes>
) {
  const [state, setState] = useState<{
    result?: JSONResponse<T> | ErrorResponse;
    loading: boolean;
  }>({
    result: null,
    loading: true,
  });
  const query = params
    ? "?" +
      Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join("&")
    : "";
  useEffect(() => {
    setState({ loading: true });
    api
      .get(path + query)
      .then((result) => setState({ result, loading: false }));
  }, [path, query]);

  return state;
}
