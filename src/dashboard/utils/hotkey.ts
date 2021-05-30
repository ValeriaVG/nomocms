export type HotKey = {
  key: string;
  ctrlKey?: true;
  altKey?: true;
  shiftKey?: true;
  // cmd || windows
  metaKey?: true;
};

export const isHotKeyPressed = (hotkey: HotKey, event: KeyboardEvent) => {
  for (const key in hotkey) {
    if (hotkey[key] && event[key] !== hotkey[key]) return false;
  }
  return true;
};

export default function createHotKey(
  definition: HotKey | HotKey[],
  action: () => void,
  element: HTMLElement = document.body
) {
  const hotkeys = Array.isArray(definition) ? definition : [definition];
  const onKeyDown = (event: KeyboardEvent) => {
    for (const hotkey of hotkeys) {
      if (isHotKeyPressed(hotkey, event)) {
        event.preventDefault();
        return action();
      }
    }
  };
  element.addEventListener("keydown", onKeyDown);
  return () => element.removeEventListener("keydown", onKeyDown);
}
