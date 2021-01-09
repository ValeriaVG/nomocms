export type TemplateData = {
  id: string;
  body: string;
  style?: string;
  head?: string;
  scope: "compiled" | "source";
};
