export type Containers = Record<"main" | "parameters" | "sidebar", HTMLElement>;
export type Page<T extends Record<string, string> = Record<string, string>> =
  | string
  | Mountable<T>
  | Renderable;

export type Renderable<
  T extends Record<string, string> = Record<string, string>
> = { render: (container: HTMLElement, params: T) => void };

export type Mountable<
  T extends Record<string, string> = Record<string, string>
> = {
  mount: (containers: Containers, params?: T) => void;
  unmount?: (containers: Containers) => void;
};
