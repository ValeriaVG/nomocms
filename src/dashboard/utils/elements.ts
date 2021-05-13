export const defineElement = (
  name: string,
  customElement: typeof HTMLElement
) => {
  // For preview sink
  if (typeof window["_elements"] === "object") window["_elements"].add(name);
  // For live-reload
  if (customElements.get(name)) return customElements.upgrade(document.body);
  customElements.define(name, customElement);
};

export const defineElements = (elements: Record<string, typeof HTMLElement>) =>
  Object.entries(elements).forEach(([name, element]) =>
    defineElement(name, element)
  );
