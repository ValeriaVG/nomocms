export type TemplateData = {
  id: string;
  body?: string;
  style?: string;
  head?: string;
  script?: string;
  /**
   * Compiled template style
   */
  compiled?: string;
};
