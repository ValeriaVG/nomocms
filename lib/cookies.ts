interface ParserState {
  key: string;
  value: string;
  isParsingKey: boolean;
  map: Map<string, string>;
}

const flush = (state: ParserState, force?: boolean) => {
  if (!force && state.isParsingKey) {
    state.isParsingKey = false;
    return;
  }
  if (!state.key) return;
  state.map.set(state.key.trim(), state.value.trim());
  state.key = "";
  state.value = "";
  state.isParsingKey = true;
};

export default function parseCookies(cookies: string): Record<string, string> {
  if (!cookies) return {};
  const state: ParserState = {
    key: "",
    value: "",
    isParsingKey: true,
    map: new Map(),
  };
  for (const c of cookies) {
    processChar(state, c);
  }
  flush(state);
  return Object.fromEntries(state.map.entries());
}

const processChar = (state: ParserState, c: string) => {
  if (c === "=") return flush(state);
  if (c === ";") return flush(state, true);
  if (state.isParsingKey) {
    state.key += c;
    return;
  }
  state.value += c;
};
