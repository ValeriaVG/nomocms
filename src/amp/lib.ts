export const html = (strings, ...rest) =>
  String.raw(strings, ...rest.map((v) => (Boolean(v) ? v : "")));
