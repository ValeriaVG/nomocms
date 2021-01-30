export type ContentPage = {
  id: number;
  path: string;
  template: string;
  title: string;
  description?: string;
  content: string;
  created?: number;
  updated?: number;
  published?: number;
  // generated
  html: string;
};
