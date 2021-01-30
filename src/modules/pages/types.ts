export type ContentPage = {
  id: number;
  path: string;
  template: string;
  title: string;
  description?: string;
  content: string;
  created?: Date;
  updated?: Date;
  published?: Date;
  // generated
  html: string;
};
