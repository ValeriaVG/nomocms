import { JSONObject } from "core/types";
import { HTTPUserInputError } from "./errors";

export type PropertyTransformer<T> = (value: any) => T;

export default function ensureType<T>(
  obj: JSONObject,
  type: { [K in keyof T]: PropertyTransformer<T[K]> }
): T {
  const validStruct = {} as T;
  for (const key of Object.keys(type)) {
    try {
      validStruct[key] = type[key](obj[key]);
    } catch (err) {
      throw new HTTPUserInputError(
        key,
        `Property "${key}" ${err?.message ?? err.toString()}`
      );
    }
  }
  return validStruct;
}
