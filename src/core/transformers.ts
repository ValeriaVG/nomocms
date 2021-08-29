import { PropertyTransformer } from "./ensureType";

export const Required =
  <T>(transformer: PropertyTransformer<T>) =>
  (value: any) => {
    if (value == undefined) throw "is required";
    return transformer(value);
  };

export const Optional =
  <T>(transformer: PropertyTransformer<T>) =>
  (value: any): T | null => {
    if (value == undefined) return null;
    return transformer(value);
  };

export const Text: PropertyTransformer<string> = (value: any) => {
  if (typeof value === "string") return value;
  throw "must be a string";
};

export const Integer: PropertyTransformer<number> = (value: any) => {
  if (Number.isSafeInteger(value)) return value;
  try {
    const intValue = parseInt(value);
    if (Number.isSafeInteger(intValue)) return intValue;
  } catch {}
  throw "must be an integer";
};

export const Float: PropertyTransformer<number> = (value: any) => {
  if (Number.isFinite(value)) return value;
  try {
    const floatValue = parseFloat(value);
    if (Number.isFinite(floatValue)) return floatValue;
  } catch {}
  throw "must be a number";
};
