export function buildPathRegExp(path: string): RegExp {
  const routePath = path.startsWith("/") ? path : "/" + path;
  return new RegExp(
    `^${routePath
      .replace(/:([a-z]+)/gi, "(?<$1>[a-z-0-9-_.]+)")
      .replace("/", "/")}$`,
    "i"
  );
}

export const buildVariablePathMap = <T>(routeMap: Map<string, T>) => {
  const variablePaths = new Map<RegExp, string>();
  for (const key of routeMap.keys()) {
    if (/\/:/.test(key)) {
      variablePaths.set(buildPathRegExp(key), key);
    }
  }
  return variablePaths;
};
