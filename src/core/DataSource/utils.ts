import { SomeDataType } from "./datatypes";

/**
 * Collects [key1,value1, key2, value2,...] array into key-value pairs
 * @param values
 */
export function collect(values: string[]): Record<string, string> | null {
  if (!values || !values.length) return null;
  const obj = {};
  for (let i = 0; i < values.length; i += 2) {
    const key = values[i];
    const value = values[i + 1];
    obj[key] = value;
  }
  return obj;
}

/**
 * Turns key value pairs into flat array
 * [key1, value1, key2, value2, ...]
 * @param input
 */
export function flatten(input: Record<string, string>) {
  return Object.entries(input).reduce((a, c) => {
    return a.concat(c);
  }, []);
}

/**
 * Encodes property values into strings,
 * according to schema
 * @param value
 */
export function encode(
  schema: { [key: string]: SomeDataType },
  value: Record<string, any>
): Record<string, string> {
  if (!schema) throw Error("Schema is required");
  if (!value) throw Error("Value should have properties to be encoded");
  const result: any = {};
  for (let key in value) {
    if (!(key in schema)) continue;
    result[key] = new (schema[key] as any)(value[key]).toString();
  }
  return result;
}

/**
 * Decode string object properties
 * according to schema
 * @param value
 */
export function decode<T>(
  schema: { [key: string]: SomeDataType },
  value: Record<string, string>
): T {
  if (!value) return null;
  const result: any = { id: value.id };
  for (let key in schema) {
    result[key] = schema[key].from(value[key]).value;
  }
  return result as T;
}
