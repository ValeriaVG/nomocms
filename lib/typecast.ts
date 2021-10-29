export const ensureInt = (value: any, fallback: number) => {
  if (typeof value !== "string" && typeof value !== "number") return fallback;
  const casted = Number(value);
  return Number.isSafeInteger(casted) ? casted : fallback;
};
