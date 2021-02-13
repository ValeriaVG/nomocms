/**
 * Prevents undefined in `${undefined && 'something'}`
 */
export const html = (strings, ...rest) =>
  String.raw(strings, ...rest.map((v) => (Boolean(v) ? v : "")));
/**
 * Escapes attributes
 */
export const attr = (strings, ...rest) =>
  '"' + String.raw(strings, ...rest).replace(/(\\|)"/g, "&quot;") + '"';
