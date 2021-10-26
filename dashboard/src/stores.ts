import { writable } from "svelte/store";

export interface User {
  id: string;
  email: string;
}
export type Theme = "dark" | "light";

export const user = writable<User | null>(null);
export const theme = writable<Theme>(null);
