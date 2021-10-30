export default function parseCookies(cookies: string): Record<string, string> {
  if (!cookies) return {};
  const map = new Map<string, string>();
  let key = "";
  let value = "";
  let isParsingKey = true;
  const flush = (force?: boolean) => {
    if (!force && isParsingKey) {
      isParsingKey = false;
      return;
    }
    if (!key) return;
    map.set(key.trim(), value.trim());
    key = "";
    value = "";
    isParsingKey = true;
  };
  for (const c of cookies) {
    switch (c) {
      case "=":
        flush();
        break;
      case ";":
        flush(true);
        break;
      default:
        if (isParsingKey) key += c;
        else value += c;
    }
  }
  flush();
  return Object.fromEntries(map.entries());
}
