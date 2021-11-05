import { buildVariablePathMap } from "lib/router";
import { SvelteComponent } from "svelte";

export default function createRouter<T>(routes: Record<string, T>) {
  const map = new Map<string, T>(Object.entries(routes));
  const variablePaths = buildVariablePathMap(map);
  return (path: string): [T, Record<string, string>] | undefined => {
    if (map.has(path)) return [map.get(path), {}];
    for (const [re, pathWithVars] of variablePaths) {
      const matches = path.match(re);
      if (matches) {
        const params = matches.groups ?? {};
        return [map.get(pathWithVars), params];
      }
    }
  };
}
