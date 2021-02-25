export type ContentPageInput = {
  template: string;
  description?: string;
  content: string;
  parent_id?: number;
};

export type ContentPage = ContentPageInput & {
  id: number;
  title: string;
  path: string;
  created?: Date;
  updated?: Date;
  // generated
  html: string;
};
