export type ContentPage = {
  id: string;
  path: string;
  template: string;
  title: string;
  description?: string;
  content: string;
  createdAt?: number;
  updatedAt?: number;
  publishedAt?: number;
};
