export type TemplateData = {
  id: string;
  body: string;
  style?: string;
  head?: string;
  type: "compiled" | "source";
};
