/**
 * SQL Template literal to format sql queries
 * >Warning: Does not escape values, use values array for user data
 */
export const sql = (template: TemplateStringsArray, ...subs: any[]) => {
  return String.raw(template, ...subs.map((s) => s || ""));
};
