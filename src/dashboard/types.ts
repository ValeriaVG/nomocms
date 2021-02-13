export type Mountable<
  T extends Record<string, string> = Record<string, string>
> =
  | string
  | {
      render: (container: HTMLElement, params?: T) => void;
    };
