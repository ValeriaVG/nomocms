export type TemplateData = {
  id: string;
  body?: string;
  style?: string;
  head?: string;
  /**
   * Compiled template style
   */
  compiled?: string;
};
